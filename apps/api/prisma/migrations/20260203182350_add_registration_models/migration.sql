-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'CANCELLED', 'CONFIRMED', 'ATTENDED', 'NO_SHOW');

-- CreateTable
CREATE TABLE "Participant" (
    "id" SERIAL NOT NULL,
    "emailNormalized" TEXT,
    "phoneNormalized" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Registration" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationFieldValue" (
    "id" SERIAL NOT NULL,
    "registrationId" INTEGER NOT NULL,
    "eventFieldId" INTEGER NOT NULL,
    "value" JSONB NOT NULL,
    "eventId" INTEGER,

    CONSTRAINT "RegistrationFieldValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Participant_emailNormalized_key" ON "Participant"("emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_phoneNormalized_key" ON "Participant"("phoneNormalized");

-- CreateIndex
CREATE INDEX "Registration_eventId_status_idx" ON "Registration"("eventId", "status");

-- CreateIndex
CREATE INDEX "Registration_participantId_idx" ON "Registration"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_eventId_participantId_key" ON "Registration"("eventId", "participantId");

-- CreateIndex
CREATE INDEX "RegistrationFieldValue_eventFieldId_idx" ON "RegistrationFieldValue"("eventFieldId");

-- CreateIndex
CREATE UNIQUE INDEX "RegistrationFieldValue_registrationId_eventFieldId_key" ON "RegistrationFieldValue"("registrationId", "eventFieldId");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationFieldValue" ADD CONSTRAINT "RegistrationFieldValue_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationFieldValue" ADD CONSTRAINT "RegistrationFieldValue_eventFieldId_fkey" FOREIGN KEY ("eventFieldId") REFERENCES "EventField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationFieldValue" ADD CONSTRAINT "RegistrationFieldValue_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Participant"
ADD CONSTRAINT "participant_has_contact"
CHECK ("emailNormalized" IS NOT NULL OR "phoneNormalized" IS NOT NULL);
