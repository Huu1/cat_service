import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserProfileFields1743784200000 implements MigrationInterface {
    name = 'AddUserProfileFields1743784200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 添加 nickname 字段
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`nickname\` varchar(50) NULL COMMENT '用户昵称'`);
        
        // 添加 avatar 字段
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`avatar\` varchar(200) NULL COMMENT '用户头像'`);
        
        // 添加 email 字段
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`email\` varchar(100) NULL COMMENT '用户邮箱'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // 回滚操作，按照相反顺序删除字段
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`email\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`avatar\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`nickname\``);
    }
}