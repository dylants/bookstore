import { createBook, getBooks } from '@/lib/actions/book';
import BookCreateInput from '@/types/BookCreateInput';
import { Format, Genre } from '@prisma/client';
import { NextRequest } from 'next/server';
import { toZod } from 'tozod';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const getSchema = z.object({
  after: z.string().optional().nullable(),
  before: z.string().optional().nullable(),
  first: z.coerce.number().optional().nullable(),
  last: z.coerce.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams.entries());
  const { after, before, first, last } = params;

  const validatedFields = getSchema.safeParse({
    after,
    before,
    first,
    last,
  });

  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const response = await getBooks({
    paginationQuery: {
      ...validatedFields.data,
    },
  });

  return Response.json(response);
}

const postSchema: toZod<BookCreateInput> = z.object({
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
  title: z.string(),
  vendorId: z.number(),
});

export async function POST(request: NextRequest) {
  const book = await request.json();

  const validatedFields = postSchema.safeParse(book);

  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const createdBook = await createBook(book);
  return Response.json(createdBook);
}
