import { MigrationInterface, QueryRunner } from 'typeorm';

export class StabilizeProvidersAndCampaignEmployees20251226001000 implements MigrationInterface {
  name = 'StabilizeProvidersAndCampaignEmployees20251226001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure providers.userId exists (add nullable column if missing)
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='providers' AND column_name='userId'
      ) THEN
        ALTER TABLE providers ADD COLUMN "userId" uuid;
      END IF;
    END$$;`);

    // Ensure FK exists
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

    // Ensure campaign_employees join table exists with expected columns
    await queryRunner.query(`DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables WHERE table_name = 'campaign_employees'
      ) THEN
        CREATE TABLE campaign_employees (
          campaign_id uuid NOT NULL,
          employee_id uuid NOT NULL,
          PRIMARY KEY (campaign_id, employee_id)
        );
        CREATE INDEX idx_campaign_employees_campaign ON campaign_employees(campaign_id);
        CREATE INDEX idx_campaign_employees_employee ON campaign_employees(employee_id);
      END IF;
    END$$;`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No destructive actions in down — leave schema intact to avoid data loss.
  }
}
