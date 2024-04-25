'use client';

import AppContext, { AppContextType } from '@/app/AppContext';
import { useContext } from 'react';

export default function useAppContext(): AppContextType {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext used outside of provider');
  }

  return context;
}
