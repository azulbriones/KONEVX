-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'CHECKBOX');

-- CreateTable
CREATE TABLE "EventField" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" "FieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL,
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventField_eventId_order_idx" ON "EventField"("eventId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "EventField_eventId_key_key" ON "EventField"("eventId", "key");

-- AddForeignKey
ALTER TABLE "EventField" ADD CONSTRAINT "EventField_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
