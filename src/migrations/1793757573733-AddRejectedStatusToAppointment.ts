import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRejectedStatusToAppointment1793757573733 implements MigrationInterface {
  name = 'AddRejectedStatusToAppointment1793757573733';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."appointment_status" RENAME TO "appointment_status_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show', 'rejected')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" TYPE "public"."appointment_status" USING "status"::"text"::"public"."appointment_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'scheduled'`,
    );
    await queryRunner.query(`DROP TYPE "public"."appointment_status_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."appointment_status_old" AS ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" TYPE "public"."appointment_status_old" USING "status"::"text"::"public"."appointment_status_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "status" SET DEFAULT 'scheduled'`,
    );
    await queryRunner.query(`DROP TYPE "public"."appointment_status"`);
    await queryRunner.query(
      `ALTER TYPE "public"."appointment_status_old" RENAME TO "appointment_status"`,
    );
  }
}
