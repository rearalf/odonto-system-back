import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePersonAndPatientTables1788297102402 implements MigrationInterface {
  name = 'CreatePersonAndPatientTables1788297102402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "person_type" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying(255) NOT NULL, "description" character varying(255), CONSTRAINT "UQ_d2cd135d78b326e81258b81c66b" UNIQUE ("name"), CONSTRAINT "PK_f900a8c313411c7da8fcbba7975" PRIMARY KEY ("id")); COMMENT ON COLUMN "person_type"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "person_type"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "person_type"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "person_type"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "person_type"."name" IS 'Identifying name of the person type'; COMMENT ON COLUMN "person_type"."description" IS 'Detailed description of the person type'`,
    );
    await queryRunner.query(
      `CREATE TABLE "person" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying(255) NOT NULL, "middleName" character varying(255), "lastName" character varying(255) NOT NULL, "profilePictureName" character varying(255), "profilePictureUrl" character varying(255), "userId" integer, "person_type_id" integer NOT NULL, "phone" character varying(9), "address" character varying(100), "occupation" character varying(50), CONSTRAINT "PK_5fdaf670315c4b7e70cce85daa3" PRIMARY KEY ("id")); COMMENT ON COLUMN "person"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "person"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "person"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "person"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "person"."firstName" IS 'Person''s first name'; COMMENT ON COLUMN "person"."middleName" IS 'Person''s middle name'; COMMENT ON COLUMN "person"."lastName" IS 'Person''s last name'; COMMENT ON COLUMN "person"."profilePictureName" IS 'File name of the profile picture'; COMMENT ON COLUMN "person"."profilePictureUrl" IS 'Direct URL to the profile picture'; COMMENT ON COLUMN "person"."userId" IS 'Associated user ID in the auth/users table'; COMMENT ON COLUMN "person"."person_type_id" IS 'Foreign key referencing person_type(id)'; COMMENT ON COLUMN "person"."phone" IS 'Contact phone number'; COMMENT ON COLUMN "person"."address" IS 'Physical/residential address'; COMMENT ON COLUMN "person"."occupation" IS 'Occupation or profession'`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."patient_gender_enum" AS ENUM('male', 'female', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "patient" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "person_id" integer NOT NULL, "birth_date" date NOT NULL, "gender" "public"."patient_gender_enum" NOT NULL, "medical_history" text, "allergic_reactions" text, "current_systemic_treatment" text, "lab_results" text, "complete_odontogram" boolean NOT NULL DEFAULT false, "has_snc_issues" boolean NOT NULL DEFAULT false, "has_svc_issues" boolean NOT NULL DEFAULT false, "has_se_issues" boolean NOT NULL DEFAULT false, "has_sme_issues" boolean NOT NULL DEFAULT false, "has_sr_issues" boolean NOT NULL DEFAULT false, "has_su_issues" boolean NOT NULL DEFAULT false, "has_sgu_issues" boolean NOT NULL DEFAULT false, "has_sgi_issues" boolean NOT NULL DEFAULT false, "system_evaluation_notes" character varying(255), CONSTRAINT "UQ_b829cf7046dfb9d4e510984e977" UNIQUE ("person_id"), CONSTRAINT "REL_b829cf7046dfb9d4e510984e97" UNIQUE ("person_id"), CONSTRAINT "PK_8dfa510bb29ad31ab2139fbfb99" PRIMARY KEY ("id")); COMMENT ON COLUMN "patient"."id" IS 'Unique record identifier'; COMMENT ON COLUMN "patient"."createdAt" IS 'Creation timestamp'; COMMENT ON COLUMN "patient"."updatedAt" IS 'Last modification timestamp'; COMMENT ON COLUMN "patient"."deletedAt" IS 'Soft delete timestamp'; COMMENT ON COLUMN "patient"."person_id" IS 'Foreign key referencing person(id)'; COMMENT ON COLUMN "patient"."birth_date" IS 'Date of birth of the patient'; COMMENT ON COLUMN "patient"."gender" IS 'Gender of the patient (enum GenderType)'; COMMENT ON COLUMN "patient"."medical_history" IS 'Medical history and pathological background'; COMMENT ON COLUMN "patient"."allergic_reactions" IS 'Known allergies and adverse reactions'; COMMENT ON COLUMN "patient"."current_systemic_treatment" IS 'Current systemic pharmacological treatment'; COMMENT ON COLUMN "patient"."lab_results" IS 'Clinical laboratory test results summary'; COMMENT ON COLUMN "patient"."complete_odontogram" IS 'Flag indicating whether initial odontogram charting is completed'; COMMENT ON COLUMN "patient"."has_snc_issues" IS 'Flag for Central Nervous System (SNC/CNS) issues or history'; COMMENT ON COLUMN "patient"."has_svc_issues" IS 'Flag for Cardiovascular System (SVC/CVS) issues or history'; COMMENT ON COLUMN "patient"."has_se_issues" IS 'Flag for Endocrine System (SE/ES) issues or history'; COMMENT ON COLUMN "patient"."has_sme_issues" IS 'Flag for Musculoskeletal System (SME/MS) issues or history'; COMMENT ON COLUMN "patient"."has_sr_issues" IS 'Flag for Respiratory System (SR/RS) issues or history'; COMMENT ON COLUMN "patient"."has_su_issues" IS 'Flag for Urinary System (SU/US) issues or history'; COMMENT ON COLUMN "patient"."has_sgu_issues" IS 'Flag for Genitourinary System (SGU/GUS) issues or history'; COMMENT ON COLUMN "patient"."has_sgi_issues" IS 'Flag for Gastrointestinal System (SGI/GIS) issues or history'; COMMENT ON COLUMN "patient"."system_evaluation_notes" IS 'Detailed clinical notes from the systems review'`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" ADD CONSTRAINT "FK_1711d76c14c9146c23087558bb3" FOREIGN KEY ("person_type_id") REFERENCES "person_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "patient" ADD CONSTRAINT "FK_b829cf7046dfb9d4e510984e977" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "patient" DROP CONSTRAINT "FK_b829cf7046dfb9d4e510984e977"`,
    );
    await queryRunner.query(
      `ALTER TABLE "person" DROP CONSTRAINT "FK_1711d76c14c9146c23087558bb3"`,
    );
    await queryRunner.query(`DROP TABLE "patient"`);
    await queryRunner.query(`DROP TYPE "public"."patient_gender_enum"`);
    await queryRunner.query(`DROP TABLE "person"`);
    await queryRunner.query(`DROP TABLE "person_type"`);
  }
}
