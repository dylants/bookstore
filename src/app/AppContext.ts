'use client';

import { Format, Genre } from '@prisma/client';
import { createContext } from 'react';

export type AppContextType = {
  formats: Array<Format>;
  genres: Array<Genre>;
};

const AppContext = createContext<AppContextType | null>(null);

export default AppContext;
