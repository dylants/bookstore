import { convertCentsToDollars } from '@/lib/money';
import BookHydrated from '@/types/BookHydrated';
import _ from 'lodash';
import Image from 'next/image';

function BookKey({
  book,
  fieldName,
}: {
  book: BookHydrated;
  fieldName: keyof BookHydrated;
}) {
  let fieldNameToDisplay: string;
  let fieldToDisplay: string | undefined;
  switch (fieldName) {
    case 'authors':
      fieldNameToDisplay = 'By';
      fieldToDisplay = book[fieldName].map((a) => a.name).join(', ');
      break;
    case 'genre':
      fieldNameToDisplay = fieldName;
      // TODO should this be a function?
      fieldToDisplay = _(book[fieldName])
        .split('_')
        .map((w) => _.capitalize(_.lowerCase(w)))
        .join(' ');
      break;
    case 'isbn13':
      fieldNameToDisplay = 'ISBN';
      fieldToDisplay = book[fieldName].toString();
      break;
    case 'priceInCents':
      fieldNameToDisplay = 'Price';
      fieldToDisplay = `$${convertCentsToDollars(book[fieldName])}`;
      break;
    case 'publishedDate':
      fieldNameToDisplay = 'Published Date';
      fieldToDisplay = book[fieldName]?.toLocaleDateString?.();
      break;
    case 'publisher':
      fieldNameToDisplay = fieldName;
      fieldToDisplay = book[fieldName].name;
      break;
    default:
      fieldNameToDisplay = fieldName;
      fieldToDisplay = book[fieldName]?.toString();
      break;
  }

  return (
    <div>
      <span className="font-bold mr-1 capitalize">{fieldNameToDisplay}:</span>
      {fieldToDisplay}
    </div>
  );
}

export default function Book({ book }: { book: BookHydrated }) {
  return (
    <div className="flex gap-4 h-[192px]">
      {book.imageUrl ? (
        <Image alt={book.title} src={book.imageUrl} width={128} height={192} />
      ) : (
        <div className="border rounded-sm border-customPalette-300 w-[128px] h-[192px] flex justify-center items-center">
          No Image
        </div>
      )}
      <div className="flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold mb-2">{book.title}</div>
        </div>
        <div>
          <BookKey book={book} fieldName="isbn13" />
          <BookKey book={book} fieldName="authors" />
          <BookKey book={book} fieldName="genre" />
          <BookKey book={book} fieldName="priceInCents" />
          <BookKey book={book} fieldName="quantity" />
        </div>
      </div>
    </div>
  );
}
