-- AlterTable
ALTER TABLE "Book"
DROP COLUMN "format",
DROP COLUMN "genre",
ADD COLUMN     "formatId" INTEGER NOT NULL,
ADD COLUMN     "genreId" INTEGER NOT NULL;

-- DropEnum
DROP TYPE "Format";

-- DropEnum
DROP TYPE "Genre";

-- CreateTable
CREATE TABLE "Format" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Format_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3),
    "displayName" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Format_displayName_key" ON "Format"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_displayName_key" ON "Genre"("displayName");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_formatId_fkey" FOREIGN KEY ("formatId") REFERENCES "Format"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
