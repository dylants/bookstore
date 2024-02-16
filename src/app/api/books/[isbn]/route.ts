import { BOOK_CREATE_INPUT_SCHEMA } from '@/app/api/books/route';
import { getBook, upsertBook } from '@/lib/actions/book';
import { NextRequest } from 'next/server';
import { fromZodError } from 'zod-validation-error';

export async function GET(
  _: NextRequest,
  { params }: { params: { isbn: string } },
) {
  const response = await getBook(BigInt(params.isbn));

  return Response.json(response);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { isbn: string } },
) {
  const book = await request.json();
  const isbn = params.isbn;

  const putSchema = BOOK_CREATE_INPUT_SCHEMA.omit({ isbn13: true });
  const isbnSchema = BOOK_CREATE_INPUT_SCHEMA.pick({ isbn13: true });

  const validatedFields = putSchema.safeParse(book);
  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const validatedIsbn = isbnSchema.safeParse({
    isbn13: isbn,
  });
  if (!validatedIsbn.success) {
    const message = fromZodError(validatedIsbn.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const upsertedBook = await upsertBook({
    ...book,
    isbn13: isbn,
  });
  return Response.json(upsertedBook);
}
