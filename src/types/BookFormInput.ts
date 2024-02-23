import BookCreateInput from '@/types/BookCreateInput';

type BookFormInput = Omit<
  BookCreateInput,
  'format' | 'genre' | 'isbn13' | 'priceInCents' | 'publishedDate' | 'quantity'
> & {
  format: string;
  genre: string;
  isbn13: string;
  priceInCents: string;
  publishedDate: string;
  quantity: string;
};

export default BookFormInput;
