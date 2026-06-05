import { prisma } from '@/lib/prisma';
import LaptopClient from './LaptopClient';

export default async function LaptopsPage() {
  const laptops = await prisma.asset.findMany({
    where: { assetType: 'LAPTOP' },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Laptops Register</h1>
        <p className="text-gray-500 mt-1">Manage company-owned laptops and BYOD devices.</p>
      </div>
      <LaptopClient initialAssets={laptops} />
    </div>
  );
}
