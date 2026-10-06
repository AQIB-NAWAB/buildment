-- AlterEnum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PLATFORM_ADMIN';

-- Update existing ADMIN users to PLATFORM_ADMIN
UPDATE "User" SET "role" = 'PLATFORM_ADMIN' WHERE "role"::text = 'ADMIN';

-- CreateEnum
CREATE TYPE "OrganizationRole" AS ENUM ('ORG_ADMIN', 'MENTOR', 'MENTEE');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PRIVATE', 'UNLISTED', 'PUBLIC_DIRECTORY');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "OrganizationRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationMember_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Course" ADD COLUMN "organizationId" TEXT;
ALTER TABLE "Course" ADD COLUMN "createdById" TEXT;
ALTER TABLE "Course" ADD COLUMN "listingStatus" "ListingStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Course" ADD COLUMN "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE';

-- Backfill createdById from mentorId for existing courses
UPDATE "Course" SET "createdById" = "mentorId" WHERE "createdById" IS NULL;

-- Make createdById NOT NULL after backfill
ALTER TABLE "Course" ALTER COLUMN "createdById" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationMember_organizationId_userId_key" ON "OrganizationMember"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "OrganizationMember_userId_idx" ON "OrganizationMember"("userId");

-- CreateIndex
CREATE INDEX "Course_organizationId_idx" ON "Course"("organizationId");

-- CreateIndex
CREATE INDEX "Course_organizationId_listingStatus_idx" ON "Course"("organizationId", "listingStatus");

-- CreateIndex
CREATE INDEX "Course_createdById_idx" ON "Course"("createdById");

-- CreateIndex
CREATE INDEX "Course_listingStatus_visibility_status_idx" ON "Course"("listingStatus", "visibility", "status");

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationMember" ADD CONSTRAINT "OrganizationMember_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
