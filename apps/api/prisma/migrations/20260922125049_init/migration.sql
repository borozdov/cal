-- CreateEnum
CREATE TYPE "DateMode" AS ENUM ('RANGE', 'EXPLICIT');

-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('COLLECTING', 'CONFIRMED');

-- CreateTable
CREATE TABLE "Poll" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adminToken" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "dateMode" "DateMode" NOT NULL,
    "dates" JSONB NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "gridStep" INTEGER NOT NULL,
    "meetingDuration" INTEGER NOT NULL,
    "deadline" TIMESTAMP(3),
    "showResultsToParticipants" BOOLEAN NOT NULL DEFAULT true,
    "status" "PollStatus" NOT NULL DEFAULT 'COLLECTING',
    "confirmedDate" TEXT,
    "confirmedStartMinute" INTEGER,
    "confirmedEndMinute" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Poll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "pollId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startMinute" INTEGER NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Poll_slug_key" ON "Poll"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_adminToken_key" ON "Poll"("adminToken");

-- CreateIndex
CREATE INDEX "Poll_status_idx" ON "Poll"("status");

-- CreateIndex
CREATE INDEX "Participant_pollId_idx" ON "Participant"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_pollId_name_key" ON "Participant"("pollId", "name");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_participantId_idx" ON "AvailabilitySlot"("participantId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_date_idx" ON "AvailabilitySlot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "AvailabilitySlot_participantId_date_startMinute_key" ON "AvailabilitySlot"("participantId", "date", "startMinute");

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
