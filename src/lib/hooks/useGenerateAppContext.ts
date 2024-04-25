'use client';

import { AppContextType } from '@/app/AppContext';
import { getFormats } from '@/lib/actions/format';
import { getGenres } from '@/lib/actions/genre';
import { Format, Genre } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

export default function useGenerateAppContext(): AppContextType | null {
  const [formats, setFormats] = useState<Array<Format>>();
  const [genres, setGenres] = useState<Array<Genre>>();

  const loadFormats = useCallback(async () => {
    const formats = await getFormats();
    setFormats(formats);
  }, []);

  const loadGenres = useCallback(async () => {
    const genres = await getGenres();
    setGenres(genres);
  }, []);

  useEffect(() => {
    loadFormats();
    loadGenres();
  }, [loadFormats, loadGenres]);

  if (!formats || !genres) {
    return null;
  }

  return {
    formats,
    genres,
  };
}
