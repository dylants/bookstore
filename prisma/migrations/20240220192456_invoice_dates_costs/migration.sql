-- AlterTable
ALTER TABLE "Invoice"
DROP COLUMN "invoiceId",
DROP COLUMN "processed",
ADD COLUMN     "dateReceived" TIMESTAMPTZ(1),
ADD COLUMN     "invoiceNumber" TEXT NOT NULL,
ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InvoiceItem"
DROP COLUMN "costInCents",
ADD COLUMN     "itemCostInCents" INTEGER NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "totalCostInCents" INTEGER NOT NULL;
