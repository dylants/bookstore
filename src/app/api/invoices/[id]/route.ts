import { getInvoice } from '@/lib/actions/invoice';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fromZodError } from 'zod-validation-error';

const getSchema = z.object({
  id: z.coerce.number(),
});

export async function GET(
  _: NextRequest,
  { params }: { params: { id: number } },
) {
  const { id } = params;

  const validatedFields = getSchema.safeParse({ id });
  if (!validatedFields.success) {
    const message = fromZodError(validatedFields.error);
    return new Response(null, {
      status: 400,
      statusText: message.toString(),
    });
  }

  const response = await getInvoice(validatedFields.data.id);

  if (!response) {
    return new Response(null, { status: 404 });
  }

  return Response.json(response);
}
