import prisma from '@/lib/prisma';

async function generateFormat(displayName: string) {
  await prisma.format.create({
    data: {
      displayName,
    },
  });
}

async function generateFormats() {
  const formats = ['Hardcover', 'Mass Market Paperback', 'Trade Paperback'];

  await Promise.all(formats.map(generateFormat));
}

async function generateGenre(displayName: string) {
  await prisma.genre.create({
    data: {
      displayName,
    },
  });
}

async function generateGenres() {
  const genres = [
    // Fiction
    'Fantasy',
    'Literary Fiction',
    'Romance',
    'Science Fiction',

    // Young Adult
    'YA Fantasy',

    // Kids
    'Middle Grade',

    // Non-Fiction
    'Business and Finance',
    'Cookbooks',
  ];

  await Promise.all(genres.map(generateGenre));
}

export default async function generateCoreSeeds() {
  await generateFormats();

  await generateGenres();
}
