'use server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotificationEmail } from '@/lib/email';

export async function assignAsset(assetId: string, employeeId: string, remarks?: string) {
  const session = await getSession();
  
  const existing = await prisma.assetAssignment.findFirst({ where: { assetId } });
  if (existing) return { success: false, error: 'Asset is already assigned.' };
  
  const assignment = await prisma.assetAssignment.create({
    data: {
      assetId,
      employeeId,
      remarks,
    },
    include: { asset: true, employee: true }
  });
  
  if (assignment.employee?.email) {
    sendNotificationEmail(
      assignment.employee.email,
      `Hardware Asset Assigned: ${assignment.asset?.model}`,
      `Hello ${assignment.employee.name},\n\nYou have been assigned a new hardware asset: ${assignment.asset?.model} (Serial: ${assignment.asset?.serialNumber || 'N/A'}).\nRemarks: ${remarks || 'None'}\n\nRegards,\nAdmin`
    );
  }

  await logAudit('AssetAssignment', assignment.id, 'INSERT', null, assignment, session?.id);
  revalidatePath('/dashboard/assignments');
  revalidatePath('/dashboard/laptops');
  revalidatePath('/dashboard/other-assets');
  return { success: true };
}

export async function returnAsset(assignmentId: string, remarks?: string) {
  const session = await getSession();
  
  const assignment = await prisma.assetAssignment.findUnique({
    where: { id: assignmentId }
  });
  
  if (!assignment) return { success: false, error: 'Assignment not found.' };
  
  const archive = await prisma.assetAssignmentArchive.create({
    data: {
      id: assignment.id,
      employeeId: assignment.employeeId,
      assetId: assignment.assetId,
      assignedDatetime: assignment.assignedDatetime,
      returnedDatetime: new Date(),
      remarks: remarks || assignment.remarks,
    }
  });
  
  await prisma.assetAssignment.delete({ where: { id: assignmentId } });
  
  await logAudit('AssetAssignmentArchive', archive.id, 'INSERT', assignment, archive, session?.id);
  revalidatePath('/dashboard/assignments');
  revalidatePath('/dashboard/laptops');
  revalidatePath('/dashboard/other-assets');
  return { success: true };
}
