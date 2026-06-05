'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { sendNotificationEmail } from '@/lib/email';

export async function createAISubscription(data: any) {
  const session = await getSession();
  const sub = await prisma.aISubscriptionRegister.create({
    data: {
      planIdentifier: data.planIdentifier,
      subscriptionName: data.subscriptionName,
      subscriptionTier: data.subscriptionTier,
      url: data.url,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
      costInr: data.costInr ? parseFloat(data.costInr) : null,
      costEur: data.costEur ? parseFloat(data.costEur) : null,
      procurementSource: data.procurementSource,
      remarks: data.remarks,
    }
  });
  await logAudit('AISubscriptionRegister', sub.id, 'INSERT', null, sub, session?.id);
  revalidatePath('/dashboard/ai-subscriptions');
  return { success: true, data: sub };
}

export async function updateAISubscription(id: string, data: any) {
  const session = await getSession();
  const old = await prisma.aISubscriptionRegister.findUnique({ where: { id }});
  const sub = await prisma.aISubscriptionRegister.update({
    where: { id },
    data: {
      planIdentifier: data.planIdentifier,
      subscriptionName: data.subscriptionName,
      subscriptionTier: data.subscriptionTier,
      url: data.url,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : null,
      costInr: data.costInr ? parseFloat(data.costInr) : null,
      costEur: data.costEur ? parseFloat(data.costEur) : null,
      procurementSource: data.procurementSource,
      remarks: data.remarks,
    }
  });
  await logAudit('AISubscriptionRegister', id, 'UPDATE', old, sub, session?.id);
  revalidatePath('/dashboard/ai-subscriptions');
  return { success: true, data: sub };
}

export async function deleteAISubscription(id: string) {
  const session = await getSession();
  const old = await prisma.aISubscriptionRegister.findUnique({ where: { id }});
  await prisma.aISubscriptionRegister.delete({ where: { id }});
  await logAudit('AISubscriptionRegister', id, 'DELETE', old, null, session?.id);
  revalidatePath('/dashboard/ai-subscriptions');
  return { success: true };
}

// Assignment actions for AI subscriptions
export async function assignAISubscription(subscriptionId: string, employeeId: string, remarks?: string) {
  const session = await getSession();
  
  // Software licenses can be assigned to many people simultaneously, but we prevent assigning the same one to the same person twice.
  const existing = await prisma.aISubscriptionAssignment.findFirst({
    where: { subscriptionId, employeeId }
  });
  if (existing) return { success: false, error: 'Employee already assigned to this subscription.' };

  const assignment = await prisma.aISubscriptionAssignment.create({
    data: { subscriptionId, employeeId, remarks },
    include: { subscription: true, employee: true }
  });

  if (assignment.employee?.email) {
    sendNotificationEmail(
      assignment.employee.email,
      `AI Subscription Granted: ${assignment.subscription?.subscriptionName}`,
      `Hello ${assignment.employee.name},\n\nYou have been granted access to the AI tool: ${assignment.subscription?.subscriptionName} (${assignment.subscription?.subscriptionTier || 'Standard'}).\nRemarks: ${remarks || 'None'}\n\nRegards,\nAdmin`
    );
  }

  await logAudit('AISubscriptionAssignment', assignment.id, 'INSERT', null, assignment, session?.id);
  revalidatePath('/dashboard/ai-subscriptions');
  return { success: true };
}

export async function unassignAISubscription(assignmentId: string, remarks?: string) {
  const session = await getSession();
  
  const assignment = await prisma.aISubscriptionAssignment.findUnique({ where: { id: assignmentId } });
  if (!assignment) return { success: false, error: 'Not found' };

  const archive = await prisma.aISubscriptionAssignmentArchive.create({
    data: {
      id: assignment.id,
      employeeId: assignment.employeeId,
      subscriptionId: assignment.subscriptionId,
      assignedDatetime: assignment.assignedDatetime,
      returnedDatetime: new Date(),
      remarks: remarks || assignment.remarks,
    }
  });

  await prisma.aISubscriptionAssignment.delete({ where: { id: assignmentId } });
  await logAudit('AISubscriptionAssignmentArchive', archive.id, 'INSERT', assignment, archive, session?.id);
  revalidatePath('/dashboard/ai-subscriptions');
  return { success: true };
}
