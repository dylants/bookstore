import { getBooks } from "@/lib/actions";
import Books from "@/components/Books";

export default async function ListPage() {
  const books = await getBooks();

  return (
    <>
      <Books books={books} />
    </>
  );
}
