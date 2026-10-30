-- CreateEnum
CREATE TYPE "RequirementStatus" AS ENUM ('OPEN', 'ON_HOLD', 'CLOSED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'CONTRACT', 'CONTRACT_TO_HIRE', 'INTERNSHIP');

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "minExperience" INTEGER,
    "maxExperience" INTEGER,
    "skills" TEXT[],
    "openings" INTEGER NOT NULL DEFAULT 1,
    "description" TEXT NOT NULL,
    "status" "RequirementStatus" NOT NULL DEFAULT 'OPEN',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementAssignment" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequirementAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequirementSequence" (
    "key" TEXT NOT NULL,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "RequirementSequence_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_referenceId_key" ON "Requirement"("referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Requirement_requirementCode_key" ON "Requirement"("requirementCode");

-- CreateIndex
CREATE INDEX "Requirement_status_idx" ON "Requirement"("status");

-- CreateIndex
CREATE INDEX "Requirement_clientName_idx" ON "Requirement"("clientName");

-- CreateIndex
CREATE INDEX "Requirement_createdById_idx" ON "Requirement"("createdById");

-- CreateIndex
CREATE INDEX "RequirementAssignment_recruiterId_isActive_idx" ON "RequirementAssignment"("recruiterId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RequirementAssignment_requirementId_recruiterId_key" ON "RequirementAssignment"("requirementId", "recruiterId");

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAssignment" ADD CONSTRAINT "RequirementAssignment_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAssignment" ADD CONSTRAINT "RequirementAssignment_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementAssignment" ADD CONSTRAINT "RequirementAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
