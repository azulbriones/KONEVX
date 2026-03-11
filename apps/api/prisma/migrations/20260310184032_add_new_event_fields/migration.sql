-- AlterEnum
ALTER TYPE "FieldType" ADD VALUE 'TEXTAREA';

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "backgroundImage" TEXT,
ADD COLUMN     "contactInfo" TEXT,
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "description" TEXT NOT NULL DEFAULT 'Descripción pendiente',
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "entryTime" TEXT,
ADD COLUMN     "exitTime" TEXT,
ADD COLUMN     "footerDescription" TEXT,
ADD COLUMN     "hashtag" TEXT,
ADD COLUMN     "heroImage" TEXT,
ADD COLUMN     "location" TEXT NOT NULL DEFAULT 'Por definir',
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "minAge" INTEGER,
ADD COLUMN     "note" TEXT DEFAULT '',
ADD COLUMN     "organizerName" TEXT NOT NULL DEFAULT 'Organizador',
ADD COLUMN     "promotionalImages" JSONB,
ADD COLUMN     "promotionalVideo" TEXT,
ADD COLUMN     "slogan" TEXT,
ADD COLUMN     "socialMediaInfo" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "thingsNotToBring" TEXT DEFAULT '',
ADD COLUMN     "thingsToBring" TEXT DEFAULT '';
