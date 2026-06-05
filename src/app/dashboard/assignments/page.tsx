import { prisma } from '@/lib/prisma';
import AssignmentClient from './AssignmentClient';

export default async function AssignmentsPage() {
  const assets = await prisma.asset.findMany({
    include: {
      assignments: {
        include: {
          employee: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const employees = await prisma.employee.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Asset Assignments</h1>
        <p className="text-gray-500 mt-1">Manage which assets are with employees and which are in the office.</p>
      </div>
      <AssignmentClient assets={assets} employees={employees} />
    </div>
  );
}
