import { prisma } from '@/lib/prisma';
import OtherAssetClient from './OtherAssetClient';

export default async function OtherAssetsPage() {
  const assets = await prisma.asset.findMany({
    where: { assetType: { not: 'LAPTOP' } },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Other Assets Register</h1>
        <p className="text-gray-500 mt-1">Manage Test Mobiles, SIM Cards, Monitors, and accessories.</p>
      </div>
      <OtherAssetClient initialAssets={assets} />
    </div>
  );
}
