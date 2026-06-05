'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

export async function createAsset(data: any) {
  const session = await getSession();
  const newAsset = await prisma.asset.create({
    data: {
      assetTag: data.assetTag,
      assetType: data.assetType,
      serialNumber: data.serialNumber,
      model: data.model,
      description: data.description,
      specsRam: data.specsRam,
      specsHdd: data.specsHdd,
      specsOs: data.specsOs,
      costInr: data.costInr ? parseFloat(data.costInr) : null,
      costEur: data.costEur ? parseFloat(data.costEur) : null,
      procurementSource: data.procurementSource,
      remarks: data.remarks,
    }
  });
  
  await logAudit('Asset', newAsset.id, 'INSERT', null, newAsset, session?.id);
  revalidatePath(`/dashboard/${data.assetType === 'LAPTOP' ? 'laptops' : 'other-assets'}`);
  return { success: true, data: newAsset };
}

export async function updateAsset(id: string, data: any) {
  const session = await getSession();
  const oldAsset = await prisma.asset.findUnique({ where: { id }});
  const updatedAsset = await prisma.asset.update({
    where: { id },
    data: {
      assetTag: data.assetTag,
      serialNumber: data.serialNumber,
      model: data.model,
      description: data.description,
      specsRam: data.specsRam,
      specsHdd: data.specsHdd,
      specsOs: data.specsOs,
      costInr: data.costInr ? parseFloat(data.costInr) : null,
      costEur: data.costEur ? parseFloat(data.costEur) : null,
      procurementSource: data.procurementSource,
      remarks: data.remarks,
    }
  });
  
  await logAudit('Asset', id, 'UPDATE', oldAsset, updatedAsset, session?.id);
  revalidatePath(`/dashboard/${oldAsset?.assetType === 'LAPTOP' ? 'laptops' : 'other-assets'}`);
  return { success: true, data: updatedAsset };
}

export async function deleteAsset(id: string) {
  const session = await getSession();
  const oldAsset = await prisma.asset.findUnique({ where: { id }});
  await prisma.asset.delete({ where: { id } });
  
  await logAudit('Asset', id, 'DELETE', oldAsset, null, session?.id);
  revalidatePath(`/dashboard/${oldAsset?.assetType === 'LAPTOP' ? 'laptops' : 'other-assets'}`);
  return { success: true };
}
