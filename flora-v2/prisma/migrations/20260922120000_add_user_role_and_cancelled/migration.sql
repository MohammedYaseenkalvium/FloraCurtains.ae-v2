-- CreateEnum (UserRole replaces the free-text users.role column)
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF');

-- Normalize any legacy role strings before the cast (no data loss for ADMIN/STAFF)
UPDATE "users" SET "role" = 'STAFF' WHERE "role" NOT IN ('ADMIN', 'STAFF');

-- Alter users.role TEXT -> UserRole preserving values
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING "role"::"UserRole";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'STAFF';

-- AlterEnum ProjectStatus: add CANCELLED via type recreation
-- (ALTER TYPE ... ADD VALUE cannot run inside a migration transaction)
CREATE TYPE "ProjectStatus_new" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'INSTALLATION', 'SNAGGING', 'COMPLETED', 'ON_HOLD', 'CANCELLED');
ALTER TABLE "projects" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "projects" ALTER COLUMN "status" TYPE "ProjectStatus_new" USING "status"::text::"ProjectStatus_new";
ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";
ALTER TYPE "ProjectStatus_new" RENAME TO "ProjectStatus";
DROP TYPE "ProjectStatus_old";
ALTER TABLE "projects" ALTER COLUMN "status" SET DEFAULT 'NOT_STARTED';
