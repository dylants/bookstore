import BookCreateInput from '@/types/BookCreateInput';

type BookFormInput = Omit<
  BookCreateInput,
  'format' | 'genre' | 'isbn13' | 'priceInCents' | 'publishedDate'
> & {
  format: string;
  genre: string;
  isbn13: string;
  priceInCents: string;
  publishedDate: string;
};

export default BookFormInput;
