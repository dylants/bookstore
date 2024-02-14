/*
  Warnings:

  - Added the required column `isPublisher` to the `BookSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isVendor` to the `BookSource` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BookSource" ADD COLUMN     "isPublisher" BOOLEAN NOT NULL,
ADD COLUMN     "isVendor" BOOLEAN NOT NULL;
