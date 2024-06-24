import BookCreateInput from '@/types/BookCreateInput';

type BookFormInput = Omit<
  BookCreateInput,
  | 'formatId'
  | 'genreId'
  | 'isbn13'
  | 'priceInCents'
  | 'publishedDate'
  | 'quantity'
> & {
  discountPercentageDisplay: number;
  formatId: number | undefined;
  genreId: number | undefined;
  isbn13: string;
  priceInCents: string;
  publishedDate: string;
  quantity: string;
};

export default BookFormInput;
