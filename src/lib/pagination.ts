import logger from '@/lib/logger';
import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import { Prisma } from '@prisma/client';
import _ from 'lodash';

export const DEFAULT_LIMIT = 10;

/* ***********************************************
 * PAGINATION REQUEST
 * ***********************************************/

export function buildFullPaginationQuery(
  values?: Partial<PaginationQuery>,
): PaginationQuery {
  return {
    after: values?.after ?? null,
    before: values?.before ?? null,
    first: values?.first ?? null,
    last: values?.last ?? null,
  };
}

export function isValidPaginationQuery(
  paginationQuery: PaginationQuery,
): boolean {
  const { after, before, first, last } = paginationQuery;

  if (before && after) {
    return false;
  } else if (_.isFinite(first) && _.isFinite(last)) {
    return false;
  }

  return true;
}

export function parseCursorAsId(
  paginationQuery: PaginationQuery,
): number | undefined {
  let id: number | undefined;
  const { before, after } = paginationQuery;

  if (before && _.isString(before)) {
    id = _.toNumber(before);
  } else if (after && _.isString(after)) {
    id = _.toNumber(after);
  }

  if (_.isNaN(id)) {
    id = undefined;
  }

  return id;
}

export function findLimit(paginationQuery: PaginationQuery): number {
  const { first, last } = paginationQuery;

  // need to also include isNumber to make typescript happy
  if (_.isNumber(first) && _.isFinite(first)) {
    return first;
  } else if (_.isNumber(last) && _.isFinite(last)) {
    return -last;
  } else {
    return DEFAULT_LIMIT;
  }
}

export function findTake(paginationQuery: PaginationQuery): number {
  const limit = findLimit(paginationQuery);
  logger.trace('limit: %j', limit);
  // add or subtract 1 to verify if we have next page
  const take = limit === 0 ? 0 : limit > 0 ? limit + 1 : limit - 1;

  return take;
}

export interface PaginationRequest {
  cursor: { id: number } | undefined;
  orderBy: { id: Prisma.SortOrder } | undefined;
  skip: number | undefined;
  take: number | undefined;
}

export function buildPaginationRequest({
  paginationQuery: inputPaginationQuery,
}: {
  paginationQuery?: PaginationQuery;
}): PaginationRequest {
  const paginationQuery = buildFullPaginationQuery(inputPaginationQuery);
  logger.trace('paginationQuery: %j', paginationQuery);

  if (!isValidPaginationQuery(paginationQuery)) {
    throw new Error('invalid pagination query');
  }

  // https://www.prisma.io/docs/orm/prisma-client/queries/pagination
  const take = findTake(paginationQuery);
  const id = parseCursorAsId(paginationQuery);
  const cursor = id ? { id } : undefined;
  const skip = cursor ? 1 : undefined;

  const paginationRequest: PaginationRequest = {
    cursor,
    orderBy: {
      id: 'asc',
    },
    skip,
    take,
  };
  logger.trace('paginationRequest: %j', paginationRequest);

  return paginationRequest;
}

/* ***********************************************
 * PAGINATION RESPONSE
 * ***********************************************/

export function buildStartCursor(
  items: Array<{ id: number }>,
): PageInfo['startCursor'] {
  return _.first(items)?.id.toString() ?? null;
}

export function buildEndCursor(
  items: Array<{ id: number }>,
): PageInfo['endCursor'] {
  return _.last(items)?.id.toString() ?? null;
}

export interface PaginationResponse<T> {
  items: Array<T>;
  pageInfo: PageInfo;
}

export function buildPaginationResponse<T extends { id: number }>({
  items,
  paginationQuery: inputPaginationQuery,
}: {
  items: Array<T>;
  paginationQuery?: PaginationQuery;
}): PaginationResponse<T> {
  const paginationQuery = buildFullPaginationQuery(inputPaginationQuery);
  logger.trace(
    'response items of length %d with ids %j',
    items.length,
    items.map((i) => i.id),
  );

  // TODO this logic can probably be improved
  let hasNextPage: boolean, hasPreviousPage: boolean;
  let responseItems = items;

  const limit = findLimit(paginationQuery);
  if (limit > 0) {
    hasNextPage = items.length > limit;
    hasPreviousPage = !!paginationQuery.after; // can this be done better?
    responseItems = limit < items.length ? _.dropRight(items, 1) : items;
  } else {
    hasNextPage = !!paginationQuery.before; // can this be done better?
    hasPreviousPage = items.length > Math.abs(limit);
    responseItems = Math.abs(limit) < items.length ? _.drop(items, 1) : items;
  }

  const endCursor = buildEndCursor(responseItems);
  const startCursor = buildStartCursor(responseItems);

  const pageInfo = {
    endCursor,
    hasNextPage,
    hasPreviousPage,
    startCursor,
  };
  logger.trace('returning pageInfo %j', pageInfo);

  return {
    items: responseItems,
    pageInfo,
  };
}
