"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="py-4 px-8 bg-slate-400 text-slate-900">
      <div className="text-xl">
        <Link href="/">bookstore</Link>
      </div>
      <div className="text-base">
        <Link
          href="/search"
          className={clsx(pathname === "/search" && "underline")}
        >
          Search
        </Link>
        {" | "}
        <Link href="/add" className={clsx(pathname === "/add" && "underline")}>
          Add
        </Link>
      </div>
    </nav>
  );
}
