import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import SideNav from '@/components/SideNav';

export const metadata: Metadata = {
  description: 'bookstore app',
  title: 'bookstore',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-customPalette-100 min-h-screen min-w-screen flex flex-col">
        <Nav />
        <div className="flex flex-1">
          <SideNav />
          <main className="flex flex-col flex-1 md:items-center mb-12">
            <div className="w-full px-4 md:w-[768px] md:px-0">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
