import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrateAppointmentStatusToTable1793800487311 implements MigrationInterface {
  name = 'MigrateAppointmentStatusToTable1793800487311';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_appointment_status_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "is_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "sort_order"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."createdAt" IS 'Creation timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."updatedAt" IS 'Last modification timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "deletedAt" TIMESTAMP`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."deletedAt" IS 'Soft delete timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "isActive" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "sortOrder" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."id" IS 'Unique record identifier'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment"."status_id" IS 'Foreign key to appointment_status table'`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_appointment_status_id" ON "appointment" ("status_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_8f42047c7975a9606576ca274e7" FOREIGN KEY ("status_id") REFERENCES "appointment_status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP CONSTRAINT "FK_8f42047c7975a9606576ca274e7"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_appointment_status_id"`);
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment"."status_id" IS NULL`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."id" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "sortOrder"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "isActive"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."deletedAt" IS 'Soft delete timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "deletedAt"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."updatedAt" IS 'Last modification timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "updatedAt"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "appointment_status"."createdAt" IS 'Creation timestamp'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" DROP COLUMN "createdAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "sort_order" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment_status" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD CONSTRAINT "FK_appointment_status_id" FOREIGN KEY ("status_id") REFERENCES "appointment_status"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
  }
}
