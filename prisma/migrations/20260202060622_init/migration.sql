-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Sales', 'Workshop', 'Manager');

-- CreateEnum
CREATE TYPE "MetalType" AS ENUM ('Gold', 'WhiteGold', 'RoseGold', 'Silver');

-- CreateEnum
CREATE TYPE "Karatage" AS ENUM ('K22', 'K21', 'K18', 'K16', 'K14', 'K9', 'Silver925');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('Cash', 'Card', 'Koko');

-- CreateEnum
CREATE TYPE "JewelrySize" AS ENUM ('Ring', 'Chain', 'Bracelet', 'BanglesWithScrews', 'BanglesWithoutScrews');

-- CreateEnum
CREATE TYPE "BillType" AS ENUM ('ReadyMade', 'CustomInitial', 'CustomFinal');

-- CreateEnum
CREATE TYPE "WastageStatus" AS ENUM ('Excess', 'Low', 'Ideal');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'Sales',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "billNumber" TEXT NOT NULL,
    "billType" "BillType" NOT NULL DEFAULT 'ReadyMade',
    "customerId" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveryDate" TIMESTAMP(3),
    "oldGoldValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerSignature" TEXT,
    "designImage" TEXT,
    "specialRemarks" TEXT,
    "targetWeight" DOUBLE PRECISION,
    "targetPrice" DOUBLE PRECISION,
    "finalWeight" DOUBLE PRECISION,
    "finalPrice" DOUBLE PRECISION,
    "worksheetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metalType" "MetalType" NOT NULL,
    "karatage" "Karatage" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "size" "JewelrySize" NOT NULL,
    "sizeValue" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "totalValue" DOUBLE PRECISION NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stone" (
    "id" TEXT NOT NULL,
    "billItemId" TEXT NOT NULL,
    "stoneType" TEXT NOT NULL,
    "treatment" TEXT,
    "numberOfStones" INTEGER NOT NULL,
    "weightPerStone" DOUBLE PRECISION NOT NULL,
    "totalWeight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metalType" "MetalType" NOT NULL,
    "karatage" "Karatage" NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "size" "JewelrySize" NOT NULL,
    "sizeValue" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventoryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorksheetItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "goldsmithName" TEXT NOT NULL,
    "jewelryDescription" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "specialRemarks" TEXT,
    "metalType" "MetalType" NOT NULL,
    "metalKaratage" "Karatage" NOT NULL,
    "targetMetalWeight" DOUBLE PRECISION NOT NULL,
    "theoreticalWastage" DOUBLE PRECISION NOT NULL,
    "goldGivenPhoto" TEXT,
    "goldPurityReport" TEXT,
    "goldGiven" DOUBLE PRECISION NOT NULL,
    "finalWeight" DOUBLE PRECISION,
    "finalWeightPhoto" TEXT,
    "finalMetalWeight" DOUBLE PRECISION,
    "allowedWastage" DOUBLE PRECISION,
    "goldBalance" DOUBLE PRECISION,
    "goldBalancePhoto" TEXT,
    "goldBalancePurity" TEXT,
    "purityComment" TEXT,
    "purityCorrectedGoldBalance" DOUBLE PRECISION,
    "actualWastage" DOUBLE PRECISION,
    "differenceInWastage" DOUBLE PRECISION,
    "wastageStatus" "WastageStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorksheetItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoneWorksheetDetail" (
    "id" TEXT NOT NULL,
    "worksheetId" TEXT NOT NULL,
    "stoneType" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "weightPhoto" TEXT,
    "smallStoneSize" TEXT,
    "numberOfSmallStones" INTEGER,
    "smallStoneWeight" DOUBLE PRECISION,
    "totalStoneWeight" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoneWorksheetDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WastageRecord" (
    "id" TEXT NOT NULL,
    "worksheetId" TEXT,
    "metalType" "MetalType" NOT NULL,
    "karatage" "Karatage" NOT NULL,
    "targetWeight" DOUBLE PRECISION NOT NULL,
    "theoreticalWastage" DOUBLE PRECISION NOT NULL,
    "finalMetalWeight" DOUBLE PRECISION NOT NULL,
    "allowedWastage" DOUBLE PRECISION NOT NULL,
    "goldGiven" DOUBLE PRECISION NOT NULL,
    "actualWastage" DOUBLE PRECISION NOT NULL,
    "difference" DOUBLE PRECISION NOT NULL,
    "status" "WastageStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WastageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedFile" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stone" ADD CONSTRAINT "Stone_billItemId_fkey" FOREIGN KEY ("billItemId") REFERENCES "BillItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoneWorksheetDetail" ADD CONSTRAINT "StoneWorksheetDetail_worksheetId_fkey" FOREIGN KEY ("worksheetId") REFERENCES "WorksheetItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
