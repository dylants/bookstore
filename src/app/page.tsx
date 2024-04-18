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
      className="flex items-center gap-2 py-0 h-[60px] w-[200px] text-lg"
      disabled={disabled}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex items-center">
      {disabled ? (
        <>{buttonContent}</>
      ) : (
        <Link href={path}>{buttonContent}</Link>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col w-full items-center mt-[80px] gap-4">
      <h1>Bookstore</h1>
      <Separator className="bg-customPalette-200 my-4" />
      <div className="grid grid-cols-2 gap-8">
        <NavLink path="/checkout">
          <ShoppingCartIcon size={18} />
          Checkout
        </NavLink>
        <NavLink path="/invoices">
          <PackageOpenIcon size={18} />
          Invoices
        </NavLink>
        <NavLink path="/orders">
          <GiftIcon size={18} />
          Orders
        </NavLink>
        <NavLink path="#" disabled>
          <ClipboardListIcon size={18} />
          Reports
        </NavLink>
      </div>
    </div>
  );
}
