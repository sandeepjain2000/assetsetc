'use server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function createParkingPermit(data: any) {
  const session = await getSession();
  
  const permit = await prisma.parkingPermit.create({
    data: {
      employeeId: data.employeeId,
      permitNumber: data.permitNumber,
      vehicleType: data.vehicleType,
      issueDate: new Date(data.issueDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      remarks: data.remarks,
    },
    include: { employee: true }
  });

  await logAudit('ParkingPermit', permit.id, 'INSERT', null, permit, session?.id);
  revalidatePath('/dashboard/parking');
  return { success: true, data: permit };
}

export async function updateParkingPermit(id: string, data: any) {
  const session = await getSession();
  const old = await prisma.parkingPermit.findUnique({ where: { id }});
  
  const permit = await prisma.parkingPermit.update({
    where: { id },
    data: {
      employeeId: data.employeeId,
      permitNumber: data.permitNumber,
      vehicleType: data.vehicleType,
      issueDate: new Date(data.issueDate),
      endDate: data.endDate ? new Date(data.endDate) : null,
      remarks: data.remarks,
    },
    include: { employee: true }
  });

  await logAudit('ParkingPermit', id, 'UPDATE', old, permit, session?.id);
  revalidatePath('/dashboard/parking');
  return { success: true, data: permit };
}

export async function archiveParkingPermit(id: string, archiveRemarks?: string) {
  const session = await getSession();
  const permit = await prisma.parkingPermit.findUnique({ where: { id }});
  if (!permit) return { success: false, error: 'Not found' };

  const archive = await prisma.parkingPermitArchive.create({
    data: {
      id: permit.id,
      employeeId: permit.employeeId,
      permitNumber: permit.permitNumber,
      vehicleType: permit.vehicleType,
      issueDate: permit.issueDate,
      endDate: permit.endDate,
      remarks: archiveRemarks || permit.remarks,
    }
  });

  await prisma.parkingPermit.delete({ where: { id }});
  await logAudit('ParkingPermitArchive', archive.id, 'INSERT', permit, archive, session?.id);
  revalidatePath('/dashboard/parking');
  return { success: true };
}
