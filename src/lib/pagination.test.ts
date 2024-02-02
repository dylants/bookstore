import {
  DEFAULT_LIMIT,
  buildEndCursor,
  buildStartCursor,
  parseCursorAsId,
  findLimit,
  isValidPaginationQuery,
  buildFullPaginationQuery,
  buildPaginationRequest,
  buildPaginationResponse,
  findTake,
} from '@/lib/pagination';
import PaginationQuery from '@/types/PaginationQuery';

describe('pagination', () => {
  const nullPaginationQuery: PaginationQuery = {
    after: null,
    before: null,
    first: null,
    last: null,
  };

  /* ***********************************************
   * PAGINATION REQUEST
   * ***********************************************/

  describe('buildFullPaginationQuery', () => {
    it('should honor values', () => {
      expect(
        buildFullPaginationQuery({
          after: 'hi',
          first: 2,
        }),
      ).toEqual({
        after: 'hi',
        before: null,
        first: 2,
        last: null,
      });
    });

    it('should populate full query', () => {
      expect(buildFullPaginationQuery()).toEqual({
        after: null,
        before: null,
        first: null,
        last: null,
      });
    });
  });

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
        first: NaN,
        last: Infinity,
        title: 'should pass when both first and last are NaN (ignoring them)',
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

    it('should use default when first is NaN/Infinity', () => {
      expect(
        findLimit({
          ...nullPaginationQuery,
          first: NaN,
        }),
      ).toEqual(DEFAULT_LIMIT);
    });

    it('should use default when last is NaN/Infinity', () => {
      expect(
        findLimit({
          ...nullPaginationQuery,
          last: Infinity,
        }),
      ).toEqual(DEFAULT_LIMIT);
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

  describe('findTake', () => {
    it('should return 1 more when limit is positive', () => {
      expect(
        findTake({
          ...nullPaginationQuery,
          first: 1,
        }),
      ).toEqual(2);
    });

    it('should return 1 less when limit is negative', () => {
      expect(
        findTake({
          ...nullPaginationQuery,
          last: 3,
        }),
      ).toEqual(-4);
    });

    it('should return 0 when limit is 0', () => {
      expect(
        findTake({
          ...nullPaginationQuery,
          first: 0,
        }),
      ).toEqual(0);
    });
  });

  describe('buildPaginationRequest', () => {
    it('should throw error when provided with bad input', () => {
      expect(() =>
        buildPaginationRequest({
          paginationQuery: {
            first: 1,
            last: 1,
          },
        }),
      ).toThrowErrorMatchingInlineSnapshot(`"invalid pagination query"`);
    });

    it('should return a cursor and skip when ID is supplied', () => {
      expect(
        buildPaginationRequest({
          paginationQuery: {
            after: '123',
            first: 1,
          },
        }),
      ).toEqual({
        cursor: {
          id: 123,
        },
        orderBy: {
          id: 'asc',
        },
        skip: 1,
        take: 2,
      });
    });

    it('should only include take when no ID is supplied', () => {
      expect(
        buildPaginationRequest({
          paginationQuery: {
            first: 1,
          },
        }),
      ).toEqual({
        orderBy: {
          id: 'asc',
        },
        take: 2,
      });
    });
  });

  /* ***********************************************
   * PAGINATION RESPONSE
   * ***********************************************/

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

  describe('buildPaginationResponse', () => {
    describe('when moving forward', () => {
      describe('yes next no previous', () => {
        const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
        const paginationQuery: PaginationQuery = {
          first: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 1 }, { id: 2 }],
            pageInfo: {
              endCursor: '2',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: '1',
            },
          });
        });
      });

      describe('no next no previous', () => {
        const items = [{ id: 1 }, { id: 2 }];
        const paginationQuery: PaginationQuery = {
          first: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 1 }, { id: 2 }],
            pageInfo: {
              endCursor: '2',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '1',
            },
          });
        });
      });

      describe('yes next yes previous', () => {
        const items = [{ id: 3 }, { id: 4 }, { id: 5 }];
        const paginationQuery: PaginationQuery = {
          after: '2',
          first: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 3 }, { id: 4 }],
            pageInfo: {
              endCursor: '4',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: '3',
            },
          });
        });
      });

      describe('no next yes previous', () => {
        const items = [{ id: 5 }, { id: 6 }];
        const paginationQuery: PaginationQuery = {
          after: '4',
          first: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 5 }, { id: 6 }],
            pageInfo: {
              endCursor: '6',
              hasNextPage: false,
              hasPreviousPage: true,
              startCursor: '5',
            },
          });
        });
      });
    });

    describe('when moving backward', () => {
      describe('yes next no previous', () => {
        const items = [{ id: 3 }, { id: 4 }];
        const paginationQuery: PaginationQuery = {
          before: '5',
          last: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 3 }, { id: 4 }],
            pageInfo: {
              endCursor: '4',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: '3',
            },
          });
        });
      });

      describe('no next no previous', () => {
        const items = [{ id: 1 }, { id: 2 }];
        const paginationQuery: PaginationQuery = {
          last: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 1 }, { id: 2 }],
            pageInfo: {
              endCursor: '2',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '1',
            },
          });
        });
      });

      describe('yes next yes previous', () => {
        const items = [{ id: 4 }, { id: 5 }, { id: 6 }];
        const paginationQuery: PaginationQuery = {
          before: '7',
          last: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 5 }, { id: 6 }],
            pageInfo: {
              endCursor: '6',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: '5',
            },
          });
        });
      });

      describe('no next yes previous', () => {
        const items = [{ id: 3 }, { id: 4 }, { id: 5 }];
        const paginationQuery: PaginationQuery = {
          last: 2,
        };

        it('should return correct items and pageInfo', () => {
          expect(buildPaginationResponse({ items, paginationQuery })).toEqual({
            items: [{ id: 4 }, { id: 5 }],
            pageInfo: {
              endCursor: '5',
              hasNextPage: false,
              hasPreviousPage: true,
              startCursor: '4',
            },
          });
        });
      });
    });
  });
});
