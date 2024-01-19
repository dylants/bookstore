import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  description: "bookstore app",
  title: "bookstore",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50">
        <Nav />
        <main className="flex flex-col min-h-full max-w-screen-md m-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
