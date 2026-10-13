import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxPatientsPerSlotColumn1791850543478 implements MigrationInterface {
  name = 'AddMaxPatientsPerSlotColumn1791850543478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD "max_patients_per_slot" integer NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "doctor_availability"."max_patients_per_slot" IS 'Maximum concurrent appointments allowed per time slot'`,
    );
    await queryRunner.query(`ALTER TABLE "person" DROP COLUMN "phone"`);
    await queryRunner.query(
      `ALTER TABLE "person" ADD "phone" character varying(8)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "person"."phone" IS 'Contact phone number'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `COMMENT ON COLUMN "person"."phone" IS 'Contact phone number'`,
    );
    await queryRunner.query(`ALTER TABLE "person" DROP COLUMN "phone"`);
    await queryRunner.query(
      `ALTER TABLE "person" ADD "phone" character varying(9)`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "doctor_availability"."max_patients_per_slot" IS 'Maximum concurrent appointments allowed per time slot'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP COLUMN "max_patients_per_slot"`,
    );
  }
}
