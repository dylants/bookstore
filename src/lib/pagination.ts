import PageInfo from '@/types/PageInfo';
import PaginationQuery from '@/types/PaginationQuery';
import _ from 'lodash';

export const DEFAULT_LIMIT = 3;

export function buildPaginationQuery(
  values: Partial<PaginationQuery>,
): PaginationQuery {
  const { after, before, first, last } = values;
  return {
    after: after ?? null,
    before: before ?? null,
    first: first ?? null,
    last: last ?? null,
  };
}

export function isValidPaginationQuery(
  paginationQuery: PaginationQuery,
): boolean {
  const { after, before, first, last } = paginationQuery;

  if (before && after) {
    return false;
  } else if (_.isNumber(first) && _.isNumber(last)) {
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

  if (_.isNumber(first)) {
    return first;
  } else if (_.isNumber(last)) {
    return -last;
  } else {
    return DEFAULT_LIMIT;
  }
}

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
