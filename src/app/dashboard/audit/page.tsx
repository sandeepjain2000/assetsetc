import { prisma } from '@/lib/prisma';
import AuditClient from './AuditClient';

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    include: { changedByEmployee: true },
    orderBy: { changedAt: 'desc' },
    take: 500 // Limit to 500 for performance
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Audit Logs</h1>
        <p className="text-gray-500 mt-1">System-wide trail of data modifications.</p>
      </div>
      <AuditClient logs={logs} />
    </div>
  );
}
