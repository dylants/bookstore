import { getBookSources } from '@/lib/actions/book-source';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const schema = z.object({
  after: z.string().optional().nullable(),
  before: z.string().optional().nullable(),
  first: z.coerce.number().optional().nullable(),
  isPublisher: z.coerce.boolean().optional(),
  isVendor: z.coerce.boolean().optional(),
  last: z.coerce.number().optional().nullable(),
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const params = Object.fromEntries(searchParams.entries());

  const validatedFields = schema.safeParse(params);

  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const { after, before, first, last } = validatedFields.data;
  const { isPublisher, isVendor } = validatedFields.data;

  const response = await getBookSources({
    isPublisher,
    isVendor,
    paginationQuery: { after, before, first, last },
  });

  return Response.json(response);
}
