import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateDoctorAvailabilityAndUnavailabilityCascade1791521140950 implements MigrationInterface {
  name = 'UpdateDoctorAvailabilityAndUnavailabilityCascade1791521140950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" DROP CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" ADD CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" DROP CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" DROP CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304"`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_unavailability" ADD CONSTRAINT "FK_e78f9cad45dc9e6fa6529f6e815" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor_availability" ADD CONSTRAINT "FK_2cc8d37cdcb4ecd1e726d6ed304" FOREIGN KEY ("doctor_id") REFERENCES "doctor"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
