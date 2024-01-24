import {
  DEFAULT_LIMIT,
  buildEndCursor,
  buildStartCursor,
  parseCursorAsId,
  findLimit,
  isValidPaginationQuery,
} from '@/lib/pagination';
import PaginationQuery from '@/types/PaginationQuery';

describe('pagination', () => {
  const nullPaginationQuery: PaginationQuery = {
    after: null,
    before: null,
    first: null,
    last: null,
  };

  describe('isValidPaginationQuery', () => {
    it.each([
      {
        after: '456',
        before: '123',
        expected: false,
        first: null,
        last: null,
        title: 'should fail when both before and after are supplied',
      },
      {
        after: null,
        before: null,
        expected: false,
        first: 1,
        last: 2,
        title: 'should fail when both first and last are supplied',
      },
      {
        after: null,
        before: null,
        expected: true,
        first: null,
        last: null,
        title: 'should pass when all arguments are null',
      },
      {
        after: '123',
        before: null,
        expected: true,
        first: 1,
        last: null,
        title: 'should pass when first and after are supplied',
      },
      {
        after: null,
        before: null,
        expected: true,
        first: 1,
        last: null,
        title: 'should pass when first is supplied',
      },
      {
        after: '123',
        before: null,
        expected: true,
        first: null,
        last: null,
        title: 'should pass when after is supplied',
      },
      {
        after: null,
        before: '123',
        expected: true,
        first: null,
        last: 1,
        title: 'should pass when last and before are supplied',
      },
      {
        after: null,
        before: null,
        expected: true,
        first: null,
        last: 1,
        title: 'should pass when last is supplied',
      },
      {
        after: null,
        before: '123',
        expected: true,
        first: null,
        last: null,
        title: 'should pass when before is supplied',
      },
    ])('$title', ({ after, before, first, last, expected }) => {
      expect(isValidPaginationQuery({ after, before, first, last })).toEqual(
        expected,
      );
    });
  });

  describe('parseCursorAsId', () => {
    it('should parse a valid before cursor', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          before: '123',
        }),
      ).toEqual(123);
    });

    it('should parse a valid after cursor', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          after: '456',
        }),
      ).toEqual(456);
    });

    it('should choose before over after when provided with both', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          after: '456',
          before: '123',
        }),
      ).toEqual(123);
    });

    it('should return undefined for invalid ID', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          before: 'hey',
        }),
      ).toEqual(undefined);
    });

    it('should return undefined for null', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          before: null,
        }),
      ).toEqual(undefined);
    });

    it('should return undefined for undefined (bad!)', () => {
      expect(
        parseCursorAsId({
          ...nullPaginationQuery,
          before: undefined as unknown as string | null,
        }),
      ).toEqual(undefined);
    });
  });

  describe('findLimit', () => {
    it('should use default when first and last are null', () => {
      expect(findLimit(nullPaginationQuery)).toEqual(DEFAULT_LIMIT);
    });

    it('should use first when supplied', () => {
      expect(
        findLimit({
          ...nullPaginationQuery,
          first: 1000,
        }),
      ).toEqual(1000);
    });

    it('should use last when supplied', () => {
      expect(
        findLimit({
          ...nullPaginationQuery,
          last: 333,
        }),
      ).toEqual(-333);
    });

    it('should provide default with bad input (bad!)', () => {
      expect(
        findLimit({ ...nullPaginationQuery, first: 'hi' as unknown as number }),
      ).toEqual(DEFAULT_LIMIT);
    });

    it('should provide default without input (bad!)', () => {
      expect(
        findLimit({
          ...nullPaginationQuery,
          first: undefined as unknown as number,
        }),
      ).toEqual(DEFAULT_LIMIT);
    });
  });

  describe('buildStartCursor', () => {
    it('should return last ID when it exists', () => {
      expect(buildStartCursor([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual('1');
    });

    it('should return null when last ID does NOT exist', () => {
      expect(buildStartCursor([])).toEqual(null);
    });
  });

  describe('buildEndCursor', () => {
    it('should return last ID when it exists', () => {
      expect(buildEndCursor([{ id: 1 }, { id: 2 }, { id: 3 }])).toEqual('3');
    });

    it('should return null when last ID does NOT exist', () => {
      expect(buildEndCursor([])).toEqual(null);
    });
  });
});
