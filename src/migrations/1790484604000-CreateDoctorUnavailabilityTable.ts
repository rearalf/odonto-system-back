import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorUnavailabilityTable1790484604000 implements MigrationInterface {
  name = 'CreateDoctorUnavailabilityTable1790484604000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctor_unavailability" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "doctor_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "reason" character varying(255), CONSTRAINT "PK_72b9aaa4d14eb5970c59db0df97" PRIMARY KEY ("id")); COMMENT ON COLUMN "doctor_unavailability"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "doctor_unavailability"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "doctor_unavailability"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "doctor_unavailability"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "doctor_unavailability"."doctor_id" IS 'Foreign key referencing doctor(id)'; COMMENT ON COLUMN "doctor_unavailability"."start_time" IS 'Start instant of the unavailability block'; COMMENT ON COLUMN "doctor_unavailability"."end_time" IS 'End instant of the unavailability block'; COMMENT ON COLUMN "doctor_unavailability"."reason" IS 'Reason behind the unavailability'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" ADD CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" DROP CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815"`,
    );
    await queryRunner.query(`DROP TABLE "doctor_unavailability"`);
  }
}
