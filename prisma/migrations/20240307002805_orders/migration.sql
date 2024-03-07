-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('OPEN', 'PAID');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "orderUID" TEXT NOT NULL,
    "orderState" "OrderState" NOT NULL,
    "orderOpenedDate" TIMESTAMPTZ(1) NOT NULL,
    "orderClosedDate" TIMESTAMPTZ(1),
    "subTotalInCents" INTEGER NOT NULL,
    "taxInCents" INTEGER NOT NULL,
    "totalInCents" INTEGER NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "productPriceInCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPriceInCents" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productType" "ProductType" NOT NULL,
    "bookId" INTEGER,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderUID_key" ON "Order"("orderUID");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE SET NULL ON UPDATE CASCADE;
