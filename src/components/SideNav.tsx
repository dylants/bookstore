"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col pt-2 bg-slate-400 text-slate-900">
      <Link
        href="/search"
        className={clsx("m-2", pathname === "/search" && "underline")}
      >
        Search
      </Link>
      <Link
        href="/add"
        className={clsx("m-2", pathname === "/add" && "underline")}
      >
        Add
      </Link>
    </nav>
  );
}
