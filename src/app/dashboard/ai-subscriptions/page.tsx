import { prisma } from '@/lib/prisma';
import AISubscriptionClient from './AISubscriptionClient';

export default async function AISubscriptionsPage() {
  const subscriptions = await prisma.aISubscriptionRegister.findMany({
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
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">AI Subscriptions Register</h1>
        <p className="text-gray-500 mt-1">Manage AI tools like ChatGPT, Claude, Copilot, and their employee assignments.</p>
      </div>
      <AISubscriptionClient initialSubscriptions={subscriptions} employees={employees} />
    </div>
  );
}
