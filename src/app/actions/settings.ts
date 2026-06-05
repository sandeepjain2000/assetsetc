'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getSetting(key: string) {
  const setting = await prisma.systemSettings.findUnique({ where: { key }});
  return setting?.value;
}

export async function updateSetting(key: string, value: string) {
  const session = await getSession();
  
  await prisma.systemSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  
  revalidatePath('/dashboard/settings');
  return { success: true };
}
