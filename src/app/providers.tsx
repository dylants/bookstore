'use client';

import AppContextProvider from '@/app/AppContextProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AppContextProvider>{children}</AppContextProvider>;
}
