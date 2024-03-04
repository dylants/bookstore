import prisma from '@/lib/prisma';
import generateCoreSeeds from './core';

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

export default async function generateCiSeeds() {
  await generateCoreSeeds();

  await createVendor('Vendor One');
}
