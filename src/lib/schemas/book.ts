import BookCreateInput from '@/types/BookCreateInput';
import { Format, Genre } from '@prisma/client';
import { toZod } from 'tozod';
import { z } from 'zod';

export const BOOK_CREATE_INPUT_SCHEMA: toZod<BookCreateInput> = z.object({
  authors: z.string(),
  // toZod does not handle enums, so avoid this typecheck
  format: z.nativeEnum(Format) as never,
  // toZod does not handle enums, so avoid this typecheck
  genre: z.nativeEnum(Genre) as never,
  imageUrl: z.string().nullable(),
  // toZod does not handle BigInts, so avoid this typecheck
  // transform the BigInt/string as input to BigInt
  isbn13: z
    .any()
    .transform((value) => {
      try {
        return BigInt(value);
      } catch (error) {
        return value;
      }
    })
    .pipe(z.bigint()) as unknown as z.ZodBigInt,
  publishedDate: z.coerce.date().nullable(),
  publisher: z.string(),
  quantity: z.number(),
  title: z.string(),
});
