-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "groupingSettings" JSONB;

-- AlterTable
ALTER TABLE "Registration" ADD COLUMN     "assignedGroup" TEXT;
