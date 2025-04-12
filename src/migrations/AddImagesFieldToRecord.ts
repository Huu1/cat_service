import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImagesFieldToRecord1712772000000 implements MigrationInterface {
    name = 'AddImagesFieldToRecord1712772000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`records\` ADD \`images\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`records\` DROP COLUMN \`images\``);
    }
}