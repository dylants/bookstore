-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CANCELLED', 'COMPLETE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SQUARE_CHECKOUT');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "orderUID" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "transactionUID" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL,
    "transactionType" "TransactionType" NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquareCheckout" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "checkoutId" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "paymentType" TEXT,
    "transactionUID" TEXT NOT NULL,

    CONSTRAINT "SquareCheckout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionUID_key" ON "Transaction"("transactionUID");

-- CreateIndex
CREATE UNIQUE INDEX "SquareCheckout_transactionUID_key" ON "SquareCheckout"("transactionUID");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_orderUID_fkey" FOREIGN KEY ("orderUID") REFERENCES "Order"("orderUID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquareCheckout" ADD CONSTRAINT "SquareCheckout_transactionUID_fkey" FOREIGN KEY ("transactionUID") REFERENCES "Transaction"("transactionUID") ON DELETE CASCADE ON UPDATE CASCADE;
