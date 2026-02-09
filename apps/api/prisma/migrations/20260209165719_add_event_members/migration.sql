-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('EDITOR', 'VIEWER');

-- CreateTable
CREATE TABLE "EventMember" (
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" "EventRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMember_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateIndex
CREATE INDEX "EventMember_userId_idx" ON "EventMember"("userId");

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMember" ADD CONSTRAINT "EventMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
