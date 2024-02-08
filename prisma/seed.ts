import { Format, Genre, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // TODO let's generate more data and use fake values
  const source1 = await prisma.bookSource.create({
    data: {
      name: 'Macmillan',
    },
  });

  const author1 = await prisma.author.create({
    data: {
      name: 'Brandon Sanderson',
    },
  });

  await prisma.book.create({
    data: {
      authors: {
        connect: author1,
      },
      format: Format.HARDCOVER,
      genre: Genre.FANTASY,
      imageUrl:
        'https://books.google.com/books/content?id=QVn-CgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      isbn13: 9780765326355,
      publishedDate: new Date('2014-03-03'),
      publisher: {
        connect: source1,
      },
      title: 'The Way of Kings',
      vendor: {
        connect: source1,
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
