-- AlterEnum
ALTER TYPE "EventRole" ADD VALUE IF NOT EXISTS 'CHECKIN';

-- Crear columna username nullable primero
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Poblar username para usuarios existentes
UPDATE "User"
SET "username" = lower(split_part(email, '@', 1)) || '_' || id
WHERE "username" IS NULL OR "username" = '';

-- Cambiar enum UserRole de forma segura
BEGIN;

CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'USER');

ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;

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
DROP TYPE "public"."UserRole_old";

ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';

COMMIT;

-- Índice único para username
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
