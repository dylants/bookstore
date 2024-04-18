-- AlterTable
ALTER TABLE "Invoice"
ADD COLUMN     "subTotalInCents" INTEGER NOT NULL,
ADD COLUMN     "taxInCents" INTEGER NOT NULL,
ADD COLUMN     "totalInCents" INTEGER NOT NULL;
