-- AlterTable
CREATE SEQUENCE mission_id_seq;
ALTER TABLE "mission" ALTER COLUMN "id" SET DEFAULT nextval('mission_id_seq');
ALTER SEQUENCE mission_id_seq OWNED BY "mission"."id";
