-- AlterEnum
ALTER TYPE "EventRole" ADD VALUE IF NOT EXISTS 'CHECKIN';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
¡
UPDATE "User"
SET "username" = lower(split_part(email, '@', 1)) || '_' || id
WHERE "username" IS NULL OR "username" = '';

UPDATE "User"
SET "role" = 'EVENT_ADMIN'
WHERE "role" IS NULL;

DO $$
BEGIN
	IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole_new') THEN
		CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'USER');
	END IF;
END $$;

ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "User"
ALTER COLUMN "role" TYPE "UserRole_new"
USING (
	CASE
		WHEN "role"::text = 'EVENT_ADMIN' THEN 'USER'::"UserRole_new"
		ELSE "role"::text::"UserRole_new"
	END
);

ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
