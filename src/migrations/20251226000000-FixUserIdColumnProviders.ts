import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUserIdColumnProviders20251226000000 implements MigrationInterface {
  name = 'FixUserIdColumnProviders20251226000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // If userId column is missing but userIdId exists, rename it.
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='providers' AND column_name='userId'
      ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='providers' AND column_name='userIdId'
      ) THEN
        ALTER TABLE providers RENAME COLUMN "userIdId" TO "userId";
      END IF;
    END$$;`);

    // Ensure foreign key exists
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'providers' AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'userId'
      ) THEN
        ALTER TABLE providers
        ADD CONSTRAINT "FK_providers_userId_users_id"
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL;
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Best-effort revert: drop FK if exists. Do not rename column back.
    await queryRunner.query(`DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'providers' AND tc.constraint_type = 'FOREIGN KEY'
          AND kcu.column_name = 'userId'
      ) THEN
        ALTER TABLE providers DROP CONSTRAINT "FK_providers_userId_users_id";
      END IF;
    END$$;`);
  }
}
