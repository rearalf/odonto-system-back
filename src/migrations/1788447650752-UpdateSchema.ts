import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchema1788447650752 implements MigrationInterface {
  name = 'UpdateSchema1788447650752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "seed_registry" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "seed_name" character varying NOT NULL, "executed_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7fa272169330fa8fed725524cbd" UNIQUE ("seed_name"), CONSTRAINT "PK_512abd743f4e8c97a37f81975b1" PRIMARY KEY ("id")); COMMENT ON COLUMN "seed_registry"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "seed_registry"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "seed_registry"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "seed_registry"."deletedAt" IS 'Soft delete timestamp'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "seed_registry"`);
  }
}
