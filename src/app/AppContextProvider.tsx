'use client';

import AppContext from '@/app/AppContext';
import useGenerateAppContext from '@/lib/hooks/useGenerateAppContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function AppContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appContext = useGenerateAppContext();

  if (!appContext) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppContext.Provider value={appContext}>{children}</AppContext.Provider>
  );
}
