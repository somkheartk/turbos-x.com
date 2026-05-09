'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useState, useTransition } from 'react';
import { approvePurchaseOrder } from '../_lib/admin-api';

type PurchaseOrderApproveButtonProps = {
  purchaseOrderId: string;
};

export default function PurchaseOrderApproveButton({
  purchaseOrderId
}: Readonly<PurchaseOrderApproveButtonProps>) {
  const router = useRouter();
  const [isPending, startApproval] = useTransition();
  const [errorMessage, setErrorMessage] = useState('');

  function handleApprove() {
    setErrorMessage('');

    startApproval(async () => {
      try {
        await approvePurchaseOrder(purchaseOrderId);
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to approve purchase order');
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={isPending}
        className="rounded-[18px] border border-[#183f9d] bg-[linear-gradient(145deg,#173eaa_0%,#1f56c5_58%,#6da7ff_180%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(23,62,170,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'กำลังอนุมัติ...' : 'Approve'}
      </button>
      {errorMessage ? <p className="text-xs text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
