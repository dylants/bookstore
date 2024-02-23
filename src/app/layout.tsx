import type { Metadata } from 'next';
import './globals.css';
import Nav from '@/components/Nav';

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
      <body className="min-h-screen min-w-screen flex flex-col">
        <Nav />
        <div className="flex flex-1">
          <main className="flex flex-col flex-1 md:items-center mb-12">
            <div className="w-full h-full px-4 md:w-[768px] md:px-0">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
