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
  PlusIcon,
} from '@radix-ui/react-icons';
import Link from 'next/link';

export default function NavMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:outline-none">
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
        <Link href="/add">
          <DropdownMenuItem>
            <div className="flex items-center w-full cursor-pointer">
              <PlusIcon />
              <span className="pl-2">Add</span>
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
