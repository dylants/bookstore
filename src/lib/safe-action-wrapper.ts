'use server';

import BadRequestError from '@/lib/errors/BadRequestError';
import logger from '@/lib/logger';
import { HttpResponse } from '@/types/HttpResponse';

export async function safeActionWrapper<Return>(
  wrappedFunction: (...args: never[]) => Promise<Return>,
  ...args: unknown[]
): Promise<HttpResponse<Return | null, BadRequestError>> {
  try {
    const data = await wrappedFunction(...(args as never[]));

    return {
      data: data ? data : null,
      status: 200,
    };
  } catch (err: unknown) {
    if (err instanceof BadRequestError) {
      return {
        data: null,
        error: {
          ...err,
          message: err.message,
          name: err.name,
        },
        status: 400,
      };
    }

    logger.error('Unknown error occurred in action!');
    logger.error(err);
    return {
      data: null,
      status: 500,
    };
  }
}
