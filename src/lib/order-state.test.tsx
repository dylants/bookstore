import { getDisplayName } from '@/lib/order-state';
import { OrderState } from '@prisma/client';

describe('order-state lib', () => {
  describe('getDisplayName', () => {
    it('should work for OPEN', () => {
      expect(getDisplayName(OrderState.OPEN)).toEqual('Open');
    });
    it('should work for PAID', () => {
      expect(getDisplayName(OrderState.PAID)).toEqual('Paid');
    });
    it('should work for PENDING_TRANSACTION', () => {
      expect(getDisplayName(OrderState.PENDING_TRANSACTION)).toEqual(
        'Pending Transaction',
      );
    });
    it('should work for unknown state', () => {
      expect(getDisplayName('foo' as OrderState)).toEqual('Unknown');
    });
  });
});
