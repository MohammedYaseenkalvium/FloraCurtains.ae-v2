/*
  Warnings:

  - A unique constraint covering the columns `[tradeName]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `contacts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL DEFAULT 'Flora Interior Operations',
    "vatNumber" TEXT NOT NULL DEFAULT '100000000000003',
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "defaultVatRate" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "quoteValidityDays" INTEGER NOT NULL DEFAULT 30,
    "logoUrl" TEXT NOT NULL DEFAULT '/images/logo.png',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_tradeName_key" ON "companies"("tradeName");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_phone_key" ON "contacts"("phone");
