import { GoogleBookSearchInput, googleBookSearch } from '@/lib/search/google';
import BookFormInput from '@/types/BookFormInput';

export type UseExternalBookSearchResult = (
  input: GoogleBookSearchInput,
) => Promise<Partial<BookFormInput>>;

export default function useExternalBookSearch(): UseExternalBookSearchResult {
  const search = async (
    input: GoogleBookSearchInput,
  ): Promise<Partial<BookFormInput>> => {
    // currently only support Google as a search mechanism
    return googleBookSearch(input);
  };

  return search;
}
