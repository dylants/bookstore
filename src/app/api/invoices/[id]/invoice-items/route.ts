import { getInvoiceItems } from '@/lib/actions/invoice-item';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const getSchema = z.object({
  after: z.string().optional().nullable(),
  before: z.string().optional().nullable(),
  first: z.coerce.number().optional().nullable(),
  id: z.coerce.number(),
  last: z.coerce.number().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params: { id } }: { params: { id: number } },
) {
  const searchParams = request.nextUrl.searchParams;
  const params = {
    ...Object.fromEntries(searchParams.entries()),
    id,
  };

  const validatedFields = getSchema.safeParse(params);

  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const { after, before, first, last } = validatedFields.data;
  const { id: invoiceId } = validatedFields.data;

  const response = await getInvoiceItems({
    invoiceId,
    paginationQuery: { after, before, first, last },
  });

  if (!response) {
    return new Response(null, { status: 404 });
  }

  return Response.json(response);
}
