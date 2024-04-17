import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ClipboardListIcon,
  GiftIcon,
  PackageOpenIcon,
  ShoppingCartIcon,
} from 'lucide-react';
import Link from 'next/link';

function NavLink({
  children,
  disabled,
  path,
}: {
  children: React.ReactNode;
  disabled?: boolean; // TODO deleteme once we have no more disabled buttons
  path: string;
}) {
  const buttonContent = (
    <Button
      variant="outline"
      className="flex items-center gap-2 py-0 h-8 w-[150px]"
      disabled={disabled}
    >
      {children}
    </Button>
  );

  return (
    <>
      {disabled ? (
        <div className="h-[50px] flex items-center">{buttonContent}</div>
      ) : (
        <Link href={path} className="h-[50px] flex items-center">
          {buttonContent}
        </Link>
      )}
    </>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col w-full items-center mt-[80px] gap-4">
      <h1>Bookstore</h1>
      <Separator className="bg-customPalette-200 my-4" />
      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
        <NavLink path="/checkout">
          <ShoppingCartIcon size={14} />
          Checkout
        </NavLink>
        <NavLink path="/invoices">
          <PackageOpenIcon size={14} />
          Invoices
        </NavLink>
        <NavLink path="/orders">
          <GiftIcon size={14} />
          Orders
        </NavLink>
        <NavLink path="#" disabled>
          <ClipboardListIcon size={14} />
          Reports
        </NavLink>
      </div>
    </div>
  );
}
