"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavElement({ path, text }: { path: string; text: string }) {
  const pathname = usePathname();

  return (
    <Link
      href={path}
      className={clsx(
        "px-4 py-2 border-x-customPalette-200 border-x-2 border-b-customPalette-400 border-b-2",
        pathname === path && "bg-customPalette-100",
      )}
    >
      {text}
    </Link>
  );
}

export default function SideNav() {
  return (
    <nav className="flex flex-col w-[140px] bg-customPalette-200 text-customPalette-500">
      <NavElement path="/search" text="Search" />
      <NavElement path="/add" text="Add" />
    </nav>
  );
}
