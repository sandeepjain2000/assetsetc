import { prisma } from '@/lib/prisma';
import EmployeeClient from './EmployeeClient';

export default async function EmployeesPage() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Employee Directory</h1>
        <p className="text-gray-500 mt-1">Manage employee profiles and remote work statuses.</p>
      </div>
      <EmployeeClient initialEmployees={employees} />
    </div>
  );
}
