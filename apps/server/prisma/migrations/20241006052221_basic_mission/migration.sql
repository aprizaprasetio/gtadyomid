-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED', 'REVIEW', 'REJECTED');

-- CreateTable
CREATE TABLE "mission" (
    "id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mission" ADD CONSTRAINT "mission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
