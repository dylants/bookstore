'use client';

import { AppContextType } from '@/app/AppContext';
import { getFormats } from '@/lib/actions/format';
import { getGenres } from '@/lib/actions/genre';
import { getInventoryAdjustmentReasons } from '@/lib/inventory-adjustment/reason';
import { Format, Genre, InventoryAdjustmentReason } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

export default function useGenerateAppContext(): AppContextType | null {
  const [formats, setFormats] = useState<Array<Format>>();
  const [genres, setGenres] = useState<Array<Genre>>();
  const [reasons, setReasons] = useState<Array<InventoryAdjustmentReason>>();

  const loadFormats = useCallback(async () => {
    const formats = await getFormats();
    setFormats(formats);
  }, []);

  const loadGenres = useCallback(async () => {
    const genres = await getGenres();
    setGenres(genres);
  }, []);

  const loadInventoryAdjustmentReasons = useCallback(async () => {
    const reasons = await getInventoryAdjustmentReasons();
    setReasons(reasons);
  }, []);

  useEffect(() => {
    loadFormats();
    loadGenres();
    loadInventoryAdjustmentReasons();
  }, [loadFormats, loadGenres, loadInventoryAdjustmentReasons]);

  if (!formats || !genres || !reasons) {
    return null;
  }

  return {
    formats,
    genres,
    inventoryAdjustmentReasons: reasons,
  };
}
