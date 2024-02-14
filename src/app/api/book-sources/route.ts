import { getBookSources } from '@/lib/actions/book-source';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const schema = z.object({
  after: z.string().optional().nullable(),
  before: z.string().optional().nullable(),
  first: z.coerce.number().optional().nullable(),
  last: z.coerce.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams.entries());
  const { after, before, first, last } = params;

  const validatedFields = schema.safeParse({
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

  const response = await getBookSources({
    paginationQuery: {
      ...validatedFields.data,
    },
  });

  return Response.json(response);
}
