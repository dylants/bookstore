import { getBooks } from "@/lib/actions";
import Books from "@/components/Books";

// NextJS will by default make this a static route, which will load
// the data during build time. Instead we want this to be loaded
// at request time (but on the server), so force a dynamic route.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
export const dynamic = "force-dynamic";

export default async function ListPage() {
  const books = await getBooks();

  return (
    <>
      <Books books={books} />
    </>
  );
}
