import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserIdToProviders20251223000000 implements MigrationInterface {
  name = 'AddUserIdToProviders20251223000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "providers" ADD COLUMN "userId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "providers" ADD CONSTRAINT "FK_providers_userId_users_id" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "providers" DROP CONSTRAINT "FK_providers_userId_users_id"`,
    );
    await queryRunner.query(`ALTER TABLE "providers" DROP COLUMN "userId"`);
  }
}
