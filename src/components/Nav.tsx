import Link from "next/link";

export default function Nav() {
  return (
    <nav className="py-4 px-8 bg-slate-400 text-slate-900">
      <div className="text-xl">
        <Link href="/">bookstore</Link>
      </div>
    </nav>
  );
}
