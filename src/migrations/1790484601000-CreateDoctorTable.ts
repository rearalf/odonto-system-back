import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateDoctorTable1790484601000 implements MigrationInterface {
  name = 'CreateDoctorTable1790484601000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "doctor" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "person_id" integer NOT NULL, "qualification" character varying(255), CONSTRAINT "UQ_fb38f3d7d38878d734a3fbb562b" UNIQUE ("person_id"), CONSTRAINT "REL_fb38f3d7d38878d734a3fbb562" UNIQUE ("person_id"), CONSTRAINT "PK_ee6bf6c8de78803212c548fcb94" PRIMARY KEY ("id")); COMMENT ON COLUMN "doctor"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "doctor"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "doctor"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "doctor"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "doctor"."person_id" IS 'Foreign key referencing person(id)'; COMMENT ON COLUMN "doctor"."qualification" IS 'Academic qualification or professional title of the doctor'`,
    );
    await queryRunner.query(
      `ALTER TABLE "doctor" ADD CONSTRAINT "FK_fb38f3d7d38878d734a3fbb562b" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "doctor" DROP CONSTRAINT "FK_fb38f3d7d38878d734a3fbb562b"`,
    );
    await queryRunner.query(`DROP TABLE "doctor"`);
  }
}
