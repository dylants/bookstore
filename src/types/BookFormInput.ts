import BookCreateInput from '@/types/BookCreateInput';

type BookFormInput = Omit<
  BookCreateInput,
  'format' | 'genre' | 'isbn13' | 'publishedDate'
> & {
  format: string;
  genre: string;
  isbn13: string;
  publishedDate: string;
};

export default BookFormInput;
