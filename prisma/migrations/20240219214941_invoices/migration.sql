-- DropForeignKey
ALTER TABLE "Book"
DROP CONSTRAINT "Book_vendorId_fkey";

-- AlterTable
ALTER TABLE "Book"
DROP COLUMN "vendorId",
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "BookSource"
ADD COLUMN     "accountNumber" TEXT,
ADD COLUMN     "discountPercentage" DECIMAL(5,4),
ADD CONSTRAINT "DiscountPercentageAboveZero" CHECK ("discountPercentage" > 0),
ADD CONSTRAINT "DiscountPercentageBelowOne" CHECK ("discountPercentage" < 1);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "invoiceId" TEXT NOT NULL,
    "invoiceDate" TIMESTAMPTZ(1) NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT FALSE,
    "vendorId" INTEGER NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "costInCents" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "invoiceId" INTEGER NOT NULL,

    CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "BookSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
