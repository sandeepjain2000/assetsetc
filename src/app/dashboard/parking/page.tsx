import { prisma } from '@/lib/prisma';
import ParkingClient from './ParkingClient';

export default async function ParkingPage() {
  const permits = await prisma.parkingPermit.findMany({
    include: { employee: true },
    orderBy: { issueDate: 'desc' }
  });

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Parking Permits</h1>
        <p className="text-gray-500 mt-1">Manage employee building parking permits and archive history.</p>
      </div>
      <ParkingClient initialPermits={permits} employees={employees} />
    </div>
  );
}
