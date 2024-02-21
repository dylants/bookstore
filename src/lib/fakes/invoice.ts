import { fakeCreatedAtUpdatedAt } from '@/lib/fakes/created-at-updated-at';
import { faker } from '@faker-js/faker';
import { Invoice } from '@prisma/client';
import { add } from 'date-fns';

export function fakeInvoice(isCompleted: boolean = false): Invoice {
  const invoiceDate = faker.date.past();
  const dateReceived = isCompleted
    ? add(new Date(invoiceDate), { days: 1 })
    : null;

  return {
    ...fakeCreatedAtUpdatedAt(),
    dateReceived,
    id: faker.number.int(),
    invoiceDate: faker.date.past(),
    invoiceNumber: faker.finance.accountNumber(),
    isCompleted,
    vendorId: faker.number.int(),
  };
}
