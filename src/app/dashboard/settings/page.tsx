import { prisma } from '@/lib/prisma';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const setting = await prisma.systemSettings.findUnique({
    where: { key: 'ALLOW_PASSWORD_CHANGE' }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">System Settings</h1>
        <p className="text-gray-500 mt-1">Manage global application configurations.</p>
      </div>
      <SettingsClient initialAllowPasswordChange={setting?.value === 'true'} />
    </div>
  );
}
