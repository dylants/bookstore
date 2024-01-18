"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  return (
    <nav className="mt-4 mb-8">
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
      <hr className="mt-4" />
    </nav>
  );
}
