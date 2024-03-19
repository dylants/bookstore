'use client';

import { Button } from '@/components/ui/button';

export default function OpenOrderActions({
  onCheckout,
  onDelete,
}: {
  onCheckout: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex gap-4 justify-end">
      <Button variant="secondary" onClick={onCheckout}>
        Resume Checkout
      </Button>
      <Button variant="destructive" onClick={onDelete}>
        Delete Order
      </Button>
    </div>
  );
}
