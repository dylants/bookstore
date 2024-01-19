import Link from "next/link";

export default function Nav() {
  return (
    <nav className="py-4 px-4 bg-customPalette-400 text-customPalette-100">
      <div className="text-xl">
        <Link href="/">bookstore</Link>
      </div>
    </nav>
  );
}
