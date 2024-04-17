'use server';

import {
  Breadcrumbs,
  BreadcrumbsDivider,
  BreadcrumbsHome,
  BreadcrumbsText,
} from '@/components/Breadcrumbs';
import Book from '@/components/book/Book';
import { getBook } from '@/lib/actions/book';

export default async function BookPage({
  params,
}: {
  params: { isbn13: string };
}) {
  const { isbn13 } = params;

  const book = await getBook(BigInt(isbn13));

  return (
    <>
      <Breadcrumbs>
        <BreadcrumbsHome />
        <BreadcrumbsDivider />
        <BreadcrumbsText>Books</BreadcrumbsText>
        <BreadcrumbsDivider />
        <BreadcrumbsText>{isbn13}</BreadcrumbsText>
      </Breadcrumbs>

      <div className="mt-8">
        {book ? (
          <Book book={book} />
        ) : (
          <>
            <p>Book not found</p>
          </>
        )}
      </div>
    </>
  );
}
