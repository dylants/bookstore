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
      <body>
        <main className="flex flex-col min-h-screen max-w-screen-md m-auto">
          <Nav />
          {children}
        </main>
      </body>
    </html>
  );
}
