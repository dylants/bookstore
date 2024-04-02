'use client';

import { Button } from '@/components/ui/button';
import { Checkmark } from '@/components/ui/checkmark';
import Link from 'next/link';

export default function CheckoutTransactionCompletePage() {
  return (
    <>
      <div className="w-[200px] h-[200px]">
        <Checkmark size="xLarge" />
      </div>
      <div>
        <p>Checkout complete!</p>
      </div>
      <div className="w-[180px]">
        <Link href="/checkout">
          <Button className="w-full" variant="default">
            Start New Checkout
          </Button>
        </Link>
      </div>
    </>
  );
}
