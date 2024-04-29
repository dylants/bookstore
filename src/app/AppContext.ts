'use client';

import { Format, Genre, InventoryAdjustmentReason } from '@prisma/client';
import { createContext } from 'react';

export type AppContextType = {
  formats: Array<Format>;
  genres: Array<Genre>;
  inventoryAdjustmentReasons: Array<InventoryAdjustmentReason>;
};

const AppContext = createContext<AppContextType | null>(null);

export default AppContext;
