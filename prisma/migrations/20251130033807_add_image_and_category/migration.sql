-- DropIndex
DROP INDEX "public"."Order_paypalId_key";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoria" TEXT,
ADD COLUMN     "imagen" TEXT;
