import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpecialtyTable1790480497590 implements MigrationInterface {
  name = 'CreateSpecialtyTable1790480497590';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "specialty" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "description" character varying(255), CONSTRAINT "UQ_6caedcf8a5f84e3072c5a380a16" UNIQUE ("name"), CONSTRAINT "PK_9cf4ae334dc4a1ab1e08956460e" PRIMARY KEY ("id")); COMMENT ON COLUMN "specialty"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "specialty"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "specialty"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "specialty"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "specialty"."name" IS 'Identifying name of the dental specialty'; COMMENT ON COLUMN "specialty"."description" IS 'Detailed description of the dental specialty'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "specialty"`);
  }
}
