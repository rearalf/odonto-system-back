import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorAvailabilityTable1790484603000 implements MigrationInterface {
  name = 'CreateDoctorAvailabilityTable1790484603000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctor_availability" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "doctor_id" integer NOT NULL, "start_time" TIME NOT NULL, "end_time" TIME NOT NULL, "slot_duration" integer NOT NULL DEFAULT '30', "is_recurring" boolean NOT NULL DEFAULT true, "day_of_week" integer, "specific_date" date, CONSTRAINT "PK_3d2b4ffe9085f8c7f9f269aed89" PRIMARY KEY ("id")); COMMENT ON COLUMN "doctor_availability"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "doctor_availability"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "doctor_availability"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "doctor_availability"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "doctor_availability"."doctor_id" IS 'Foreign key referencing doctor(id)'; COMMENT ON COLUMN "doctor_availability"."start_time" IS 'Start time of the attention block'; COMMENT ON COLUMN "doctor_availability"."end_time" IS 'End time of the attention block'; COMMENT ON COLUMN "doctor_availability"."slot_duration" IS 'Duration in minutes of each appointment slot'; COMMENT ON COLUMN "doctor_availability"."is_recurring" IS 'Flag indicating whether the block repeats weekly'; COMMENT ON COLUMN "doctor_availability"."day_of_week" IS 'Day of the week the block applies to (0 = Sunday)'; COMMENT ON COLUMN "doctor_availability"."specific_date" IS 'Exact date the block applies to'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`,
    );
    await queryRunner.query(`DROP TABLE "doctor_availability"`);
  }
}
