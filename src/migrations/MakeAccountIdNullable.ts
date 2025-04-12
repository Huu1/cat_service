import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeAccountIdNullable1712771227000 implements MigrationInterface {
    name = 'MakeAccountIdNullable1712771227000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`records\` MODIFY \`accountId\` int NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`records\` MODIFY \`accountId\` int NOT NULL`);
    }
}