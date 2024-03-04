import prisma from '@/lib/prisma';
import generateCiSeeds from './ci';

generateCiSeeds()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
