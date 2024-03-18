'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
  CardStackIcon,
  ReaderIcon,
  BackpackIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';

export default function NavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="focus-visible:outline-none"
        data-testid="nav-menu"
      >
        <HamburgerMenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href="/search">
          <DropdownMenuItem>
            <div className="flex items-center w-full cursor-pointer">
              <MagnifyingGlassIcon />
              <span className="pl-2">Search</span>
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/invoices">
          <DropdownMenuItem>
            <div className="flex items-center w-full cursor-pointer">
              <ReaderIcon />
              <span className="pl-2">Invoices</span>
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/orders">
          <DropdownMenuItem>
            <div className="flex items-center w-full cursor-pointer">
              <BackpackIcon />
              <span className="pl-2">Orders</span>
            </div>
          </DropdownMenuItem>
        </Link>
        <Link href="/list">
          <DropdownMenuItem>
            <div className="flex items-center w-full cursor-pointer">
              <CardStackIcon />
              <span className="pl-2">List</span>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
