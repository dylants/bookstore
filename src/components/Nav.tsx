'use client';

import SearchCommandContainer from '@/app/search/SearchCommandContainer';
import { Button } from '@/components/ui/button';
import clsx from 'clsx';
import {
  GiftIcon,
  NotepadTextIcon,
  ShoppingCartIcon,
  UserIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function NavLink({
  children,
  path,
}: {
  children: React.ReactNode;
  path: string;
}) {
  const pathname = usePathname();

  return (
    <Link href={path} className="h-[50px] flex items-center">
      <Button
        variant="ghost"
        className={clsx(
          'flex items-center gap-2 py-0 h-8',
          pathname.includes(path) &&
            'bg-customPalette-100 text-customPalette-300 hover:bg-customPalette-100',
        )}
      >
        {children}
      </Button>
    </Link>
  );
}

export default function Nav() {
  return (
    <nav className="flex justify-between items-center w-full h-[50px] px-4 bg-customPalette-400 text-customPalette-100">
      <div className="text-xl">
        <Link href="/">bookstore</Link>
      </div>
      <div className="absolute m-auto left-0 right-0 w-fit flex gap-4 text-xl">
        <NavLink path="/checkout">
          <ShoppingCartIcon size={14} />
          Checkout
        </NavLink>
        <NavLink path="/orders">
          <GiftIcon size={14} />
          Orders
        </NavLink>
        <NavLink path="/invoices">
          <NotepadTextIcon size={14} />
          Invoices
        </NavLink>
      </div>
      <div className="flex gap-4 items-center">
        <SearchCommandContainer />
        <UserIcon size={18} />
      </div>
    </nav>
  );
}
