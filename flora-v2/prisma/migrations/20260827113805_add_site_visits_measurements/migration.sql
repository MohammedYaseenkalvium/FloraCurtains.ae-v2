-- CreateEnum
CREATE TYPE "SiteVisitStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "MeasurementUnit" AS ENUM ('MM', 'CM', 'M', 'FT', 'IN');

-- CreateTable
CREATE TABLE "site_visits" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "projectId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "status" "SiteVisitStatus" NOT NULL DEFAULT 'SCHEDULED',
    "siteAddress" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurement_sheets" (
    "id" TEXT NOT NULL,
    "siteVisitId" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "openingName" TEXT,
    "openingType" TEXT,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "unit" "MeasurementUnit" NOT NULL DEFAULT 'MM',
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "curtainType" TEXT,
    "trackType" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurement_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_visit_attachments" (
    "id" TEXT NOT NULL,
    "siteVisitId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "mimeType" TEXT,
    "caption" TEXT,
    "uploadedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visit_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_visits_enquiryId_idx" ON "site_visits"("enquiryId");

-- CreateIndex
CREATE INDEX "site_visits_projectId_idx" ON "site_visits"("projectId");

-- CreateIndex
CREATE INDEX "site_visits_status_idx" ON "site_visits"("status");

-- CreateIndex
CREATE INDEX "site_visits_scheduledAt_idx" ON "site_visits"("scheduledAt");

-- CreateIndex
CREATE INDEX "measurement_sheets_siteVisitId_idx" ON "measurement_sheets"("siteVisitId");

-- CreateIndex
CREATE INDEX "site_visit_attachments_siteVisitId_idx" ON "site_visit_attachments"("siteVisitId");

-- AddForeignKey
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "enquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visits" ADD CONSTRAINT "site_visits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurement_sheets" ADD CONSTRAINT "measurement_sheets_siteVisitId_fkey" FOREIGN KEY ("siteVisitId") REFERENCES "site_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_visit_attachments" ADD CONSTRAINT "site_visit_attachments_siteVisitId_fkey" FOREIGN KEY ("siteVisitId") REFERENCES "site_visits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
