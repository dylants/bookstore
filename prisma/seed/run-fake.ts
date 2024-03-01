import prisma from '@/lib/prisma';
import generateFakeSeeds from './fake';

generateFakeSeeds()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
