import prisma from '@/lib/prisma';
import generateCoreSeeds from './core';
import { upsertBook } from '@/lib/actions/book';
import { findFormatOrThrow } from '@/lib/actions/format';
import { findGenreOrThrow } from '@/lib/actions/genre';
import { Prisma } from '@prisma/client';

async function createVendor(name: string) {
  // TODO replace with create vendor once it exists
  return await prisma.bookSource.create({
    data: {
      accountNumber: '123',
      discountPercentage: 0.4,
      isPublisher: false,
      isVendor: true,
      name,
    },
  });
}

/**
 * Adds book inventory without an invoice or invoice items, which is "okay"
 * for seed data but probably should be improved at some point.
 */
async function addBookInventory() {
  const { id: formatId } = await findFormatOrThrow('Trade Paperback');
  const { id: genreId } = await findGenreOrThrow('Fantasy');

  return prisma.$transaction(
    async (tx) => {
      await upsertBook({
        book: {
          authors: 'Sarah J. Maas',
          formatId,
          genreId,
          imageUrl:
            'https://books.google.com/books/content?id=N_haEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
          isbn13: BigInt('9781635575583'),
          priceInCents: 1999,
          publishedDate: new Date('2020-06-02T05:00:00.000Z'),
          publisher: 'Bloomsbury Publishing USA',
          quantity: 5,
          title: 'A Court of Mist and Fury',
        },
        tx,
      });

      await upsertBook({
        book: {
          authors: 'Brandon Sanderson',
          formatId,
          genreId,
          imageUrl:
            'https://books.google.com/books/content?id=jbJtEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
          isbn13: BigInt('9781250868282'),
          priceInCents: 2199,
          publishedDate: new Date('2023-02-14T05:00:00.000Z'),
          publisher: 'Tor Books',
          quantity: 2,
          title: 'Mistborn',
        },
        tx,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    },
  );
}

export default async function generateCiSeeds() {
  await generateCoreSeeds();

  await createVendor('Vendor One');
  await addBookInventory();
}
