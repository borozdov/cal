-- Polls become "chosen days × chosen start times". The old grid-shaped polls
-- cannot be mapped onto that model, so they are dropped.
DELETE FROM "Poll";

DROP INDEX IF EXISTS "Poll_status_idx";
DROP INDEX IF EXISTS "AvailabilitySlot_date_idx";

ALTER TABLE "Poll"
  DROP COLUMN "description",
  DROP COLUMN "dateMode",
  DROP COLUMN "startMinute",
  DROP COLUMN "endMinute",
  DROP COLUMN "gridStep",
  DROP COLUMN "meetingDuration",
  DROP COLUMN "deadline",
  DROP COLUMN "showResultsToParticipants",
  DROP COLUMN "status",
  DROP COLUMN "confirmedEndMinute",
  ADD COLUMN "times" JSONB NOT NULL,
  ADD COLUMN "duration" INTEGER NOT NULL;

DROP TYPE "DateMode";
DROP TYPE "PollStatus";
