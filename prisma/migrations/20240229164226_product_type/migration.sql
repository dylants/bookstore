-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('BOOK');

-- AlterTable
ALTER TABLE "InvoiceItem"
ADD COLUMN     "productType" "ProductType" NOT NULL,
ALTER COLUMN "bookId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "InvoiceItem" DROP CONSTRAINT "InvoiceItem_bookId_fkey";
-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
