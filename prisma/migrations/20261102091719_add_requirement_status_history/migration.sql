-- CreateTable
CREATE TABLE "RequirementStatusHistory" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "previousStatus" "RequirementStatus" NOT NULL,
    "newStatus" "RequirementStatus" NOT NULL,
    "reason" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequirementStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RequirementStatusHistory_requirementId_createdAt_idx" ON "RequirementStatusHistory"("requirementId", "createdAt");

-- CreateIndex
CREATE INDEX "RequirementStatusHistory_changedById_idx" ON "RequirementStatusHistory"("changedById");

-- AddForeignKey
ALTER TABLE "RequirementStatusHistory" ADD CONSTRAINT "RequirementStatusHistory_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "Requirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequirementStatusHistory" ADD CONSTRAINT "RequirementStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
