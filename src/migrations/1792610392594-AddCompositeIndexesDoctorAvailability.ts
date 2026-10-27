import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompositeIndexesDoctorAvailability1792610392594 implements MigrationInterface {
  name = 'AddCompositeIndexesDoctorAvailability1792610392594';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_doctor_availability_doctor_recurring_date" ON "doctor_availability" ("doctor_id", "is_recurring", "day_of_week", "specific_date") WHERE "deletedAt" IS NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_doctor_unavailability_doctor_timerange" ON "doctor_unavailability" ("doctor_id", "start_time", "end_time") WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."idx_doctor_unavailability_doctor_timerange"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_doctor_availability_doctor_recurring_date"`,
    );
  }
}
