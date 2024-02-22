import BookSourceSerialized from '@/types/BookSourceSerialized';
import { BookSource } from '@prisma/client';

export function serializeBookSource(
  bookSource: BookSource,
): BookSourceSerialized {
  const discountPercentage = bookSource.discountPercentage?.toNumber() || null;

  return {
    ...bookSource,
    discountPercentage,
  };
}
