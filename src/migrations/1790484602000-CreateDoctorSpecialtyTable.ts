import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorSpecialtyTable1790484602000 implements MigrationInterface {
  name = 'CreateDoctorSpecialtyTable1790484602000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctor_specialty" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "doctor_id" integer NOT NULL, "specialty_id" integer NOT NULL, "is_primary" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_bb2b1ec7556ecdf92c8b6cc8cf7" PRIMARY KEY ("id")); COMMENT ON COLUMN "doctor_specialty"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "doctor_specialty"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "doctor_specialty"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "doctor_specialty"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "doctor_specialty"."doctor_id" IS 'Foreign key referencing doctor(id)'; COMMENT ON COLUMN "doctor_specialty"."specialty_id" IS 'Foreign key referencing specialty(id)'; COMMENT ON COLUMN "doctor_specialty"."is_primary" IS 'Flag marking the main specialty of the doctor'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_specialty" ADD CONSTRAINT "FK_f094b41552f4096abd621b72896" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_specialty" ADD CONSTRAINT "FK_7792fabe9bfec740f0ec9027347" FOREIGN KEY ("specialty_id") REFERENCES "specialty"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_specialty" DROP CONSTRAINT "FK_7792fabe9bfec740f0ec9027347"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_specialty" DROP CONSTRAINT "FK_f094b41552f4096abd621b72896"`,
    );
    await queryRunner.query(`DROP TABLE "doctor_specialty"`);
  }
}
