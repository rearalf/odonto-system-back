import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAppointmentStatusTable1794629536475 implements MigrationInterface {
  name = 'CreateAppointmentStatusTable1794629536475';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "appointment_status" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(50) NOT NULL, "color" character varying(20) NOT NULL, "description" character varying(255), "isActive" boolean NOT NULL DEFAULT true, "sortOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_4fec1f328aaaeb498d77d3d0a34" UNIQUE ("name"), CONSTRAINT "PK_8f42047c7975a9606576ca274e7" PRIMARY KEY ("id")); COMMENT ON COLUMN "appointment_status"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "appointment_status"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "appointment_status"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "appointment_status"."deletedAt" IS 'Soft delete timestamp'`,
    );
    await queryRunner.query(
      `CREATE TABLE "appointment" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "reason" character varying(255), "notes" character varying(255), "status_id" integer NOT NULL, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "modified_at" TIMESTAMP, "modification_reason" character varying(255), "doctor_id" integer NOT NULL, "patient_id" integer NOT NULL, "is_walk_in" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_e8be1a53027415e709ce8a2db74" PRIMARY KEY ("id")); COMMENT ON COLUMN "appointment"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "appointment"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "appointment"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "appointment"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "appointment"."reason" IS 'Primary reason for the medical consultation'; COMMENT ON COLUMN "appointment"."notes" IS 'Additional notes or administrative remarks'; COMMENT ON COLUMN "appointment"."status_id" IS 'Foreign key to appointment_status table'; COMMENT ON COLUMN "appointment"."start_time" IS 'Scheduled start date and time with time zone'; COMMENT ON COLUMN "appointment"."end_time" IS 'Scheduled or actual end date and time with time zone'; COMMENT ON COLUMN "appointment"."modified_at" IS 'Timestamp when a manual change or reschedule took place'; COMMENT ON COLUMN "appointment"."modification_reason" IS 'Reason provided for modifying or rescheduling the appointment'; COMMENT ON COLUMN "appointment"."doctor_id" IS 'Identifier of the assigned doctor (FK)'; COMMENT ON COLUMN "appointment"."patient_id" IS 'Identifier of the assigned patient (FK)'; COMMENT ON COLUMN "appointment"."is_walk_in" IS 'Flags whether the patient arrived without a prior booking'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointment_status_id" ON "appointment" ("status_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointment_doctor_id" ON "appointment" ("doctor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointment_patient_id" ON "appointment" ("patient_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_8f42047c7975a9606576ca274e7" FOREIGN KEY ("status_id") REFERENCES "appointment_status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_9a9c484aa4a944eaec632e00a81" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_86b3e35a97e289071b4785a1402" FOREIGN KEY ("patient_id") REFERENCES "patient"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_86b3e35a97e289071b4785a1402"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_9a9c484aa4a944eaec632e00a81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_8f42047c7975a9606576ca274e7"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_appointment_patient_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_appointment_doctor_id"`);
    await queryRunner.query(`DROP INDEX "public"."idx_appointment_status_id"`);
    await queryRunner.query(`DROP TABLE "appointment"`);
    await queryRunner.query(`DROP TABLE "appointment_status"`);
  }
}
