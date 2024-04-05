import { deleteOrderSafe } from '@/lib/actions/order-safe';
import BadRequestError from '@/lib/errors/BadRequestError';

const mockDeleteOrder = jest.fn();
jest.mock('./order', () => ({
  ...jest.requireActual('./order'),
  deleteOrder: (...args: unknown[]) => mockDeleteOrder(...args),
}));

describe('order safe actions', () => {
  describe('deleteOrderSafe', () => {
    beforeEach(() => {
      mockDeleteOrder.mockReset();
    });

    it('should return 200 when successful', async () => {
      expect(await deleteOrderSafe('1')).toEqual({
        data: null,
        status: 200,
      });
    });

    it('should return error when deleteOrder throws BadRequestError', async () => {
      mockDeleteOrder.mockRejectedValue(new BadRequestError('bad input'));

      expect(await deleteOrderSafe('1')).toEqual({
        data: null,
        error: {
          message: 'bad input',
          name: BadRequestError.name,
        },
        status: 400,
      });
    });

    it('should return error when deleteOrder throws Error', async () => {
      mockDeleteOrder.mockRejectedValue(new Error('unrecognized error'));

      expect(await deleteOrderSafe('1')).toEqual({
        data: null,
        status: 500,
      });
    });
  });
});
