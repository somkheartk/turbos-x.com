'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { updatePosUser } from '../_lib/pos-api';

type Props = {
  readonly userId: string;
  readonly currentStatus: 'Active' | 'Inactive';
};

export function UserToggleButton({ userId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await updatePosUser(userId, {
        status: currentStatus === 'Active' ? 'Inactive' : 'Active',
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        currentStatus === 'Active'
          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      }`}
    >
      {loading ? '...' : currentStatus === 'Active' ? 'Deactivate' : 'Activate'}
    </button>
  );
}
