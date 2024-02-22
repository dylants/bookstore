import { BookSource } from '@prisma/client';

type BookSourceSerialized = Omit<BookSource, 'discountPercentage'> & {
  discountPercentage: number | null;
};

export default BookSourceSerialized;
