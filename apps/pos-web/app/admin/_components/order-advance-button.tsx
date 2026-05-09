'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState, useTransition } from 'react';
import { advanceAdminOrder } from '../_lib/admin-api';

type OrderAdvanceButtonProps = {
  orderNumber: string;
};

export default function OrderAdvanceButton({ orderNumber }: Readonly<OrderAdvanceButtonProps>) {
  const router = useRouter();
  const [isPending, startAdvancing] = useTransition();
  const [errorMessage, setErrorMessage] = useState('');

  function handleAdvanceOrder() {
    setErrorMessage('');

    startAdvancing(async () => {
      try {
        await advanceAdminOrder(orderNumber);
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to advance sales order');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleAdvanceOrder}
        disabled={isPending}
        className="rounded-[18px] border border-[#183f9d] bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_58%,#6da7ff_180%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(23,62,170,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'กำลังอัปเดต...' : 'Advance order'}
      </button>
      {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}