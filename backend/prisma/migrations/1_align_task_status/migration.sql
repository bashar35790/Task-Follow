-- Align TaskStatus with the application schema (pending/completed) and remove
-- the unused tag column left behind by an abandoned kanban experiment.
CREATE TYPE "TaskStatus_new" AS ENUM ('pending', 'completed');

ALTER TABLE "tasks" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "tasks"
  ALTER COLUMN "status" TYPE "TaskStatus_new"
  USING (
    CASE
      WHEN "status"::text IN ('completed', 'done') THEN 'completed'
      ELSE 'pending'
    END
  )::"TaskStatus_new";

ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";

ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending'::"TaskStatus";

ALTER TABLE "tasks" DROP COLUMN IF EXISTS "tag";
