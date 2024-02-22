import { fakeVendor } from '@/lib/fakes/book-source';
import { serializeBookSource } from '@/lib/serializers/book-source';
import { BookSource, Prisma } from '@prisma/client';

describe('book source serializer', () => {
  it('should serialize correctly with a discount percentage', () => {
    const vendor: BookSource = {
      ...fakeVendor(),
      discountPercentage: new Prisma.Decimal(0.68),
    };

    expect(serializeBookSource(vendor)).toEqual({
      ...vendor,
      discountPercentage: 0.68,
    });
  });

  it('should serialize correctly with no discount percentage', () => {
    const vendor: BookSource = {
      ...fakeVendor(),
      discountPercentage: null,
    };

    expect(serializeBookSource(vendor)).toEqual({
      ...vendor,
      discountPercentage: null,
    });
  });
});
