'use client';

import { useState } from 'react';
import { updateSetting } from '@/app/actions/settings';

export default function SettingsClient({ initialAllowPasswordChange }: { initialAllowPasswordChange: boolean }) {
  const [allowPasswordChange, setAllowPasswordChange] = useState(initialAllowPasswordChange);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggle = async () => {
    setIsSaving(true);
    const newValue = !allowPasswordChange;
    await updateSetting('ALLOW_PASSWORD_CHANGE', newValue ? 'true' : 'false');
    setAllowPasswordChange(newValue);
    setIsSaving(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm max-w-2xl">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
      
      <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
        <div>
          <h3 className="font-medium text-gray-900">Allow Password Changes</h3>
          <p className="text-sm text-gray-500 mt-1">If enabled, users can change their own passwords from the portal.</p>
        </div>
        <button 
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${allowPasswordChange ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowPasswordChange ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </div>
  );
}
