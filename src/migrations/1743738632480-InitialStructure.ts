import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialStructure1743738632480 implements MigrationInterface {
    name = 'InitialStructure1743738632480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_3aa23c0a6d107393e8b40e3e2a6\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_4f4a464da158dd4e3f6184b749f\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_e6c5511ddffe47a376a85bcbf6a\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_15234590e36c4749649986701f1\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_9237a6e731418bb2b6111d17fb1\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_98973d612b97d87f64b4afabe87\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_b392510e8a9898d395a871bd9cf\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP FOREIGN KEY \`FK_bb8627d137a861e2d5dc8d1eb20\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` DROP FOREIGN KEY \`FK_b2f0366aa9349789527e0c36d97\``);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` DROP FOREIGN KEY \`FK_df951a64f09865171d2d7a502b1\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` CHANGE \`balance\` \`balance\` decimal(10,2) NOT NULL COMMENT '账户余额' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`amount\` \`amount\` decimal(10,2) NOT NULL COMMENT '记录金额'`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`action\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`ip\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`ip\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`userAgent\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_3aa23c0a6d107393e8b40e3e2a6\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_4f4a464da158dd4e3f6184b749f\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_e6c5511ddffe47a376a85bcbf6a\` FOREIGN KEY (\`templateId\`) REFERENCES \`account_templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_b392510e8a9898d395a871bd9cf\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_15234590e36c4749649986701f1\` FOREIGN KEY (\`bookId\`) REFERENCES \`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_98973d612b97d87f64b4afabe87\` FOREIGN KEY (\`accountId\`) REFERENCES \`accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_9237a6e731418bb2b6111d17fb1\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD CONSTRAINT \`FK_bb8627d137a861e2d5dc8d1eb20\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` ADD CONSTRAINT \`FK_df951a64f09865171d2d7a502b1\` FOREIGN KEY (\`usersId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` ADD CONSTRAINT \`FK_b2f0366aa9349789527e0c36d97\` FOREIGN KEY (\`rolesId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` DROP FOREIGN KEY \`FK_b2f0366aa9349789527e0c36d97\``);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` DROP FOREIGN KEY \`FK_df951a64f09865171d2d7a502b1\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\``);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\``);
        await queryRunner.query(`ALTER TABLE \`books\` DROP FOREIGN KEY \`FK_bb8627d137a861e2d5dc8d1eb20\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_9237a6e731418bb2b6111d17fb1\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_98973d612b97d87f64b4afabe87\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_15234590e36c4749649986701f1\``);
        await queryRunner.query(`ALTER TABLE \`records\` DROP FOREIGN KEY \`FK_b392510e8a9898d395a871bd9cf\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_e6c5511ddffe47a376a85bcbf6a\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_4f4a464da158dd4e3f6184b749f\``);
        await queryRunner.query(`ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_3aa23c0a6d107393e8b40e3e2a6\``);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`userAgent\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`userAgent\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`ip\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`ip\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`action\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`action\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`logs\` DROP COLUMN \`username\``);
        await queryRunner.query(`ALTER TABLE \`logs\` ADD \`username\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`records\` CHANGE \`amount\` \`amount\` decimal NOT NULL COMMENT '记录金额'`);
        await queryRunner.query(`ALTER TABLE \`accounts\` CHANGE \`balance\` \`balance\` decimal NOT NULL COMMENT '账户余额' DEFAULT '0.00'`);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` ADD CONSTRAINT \`FK_df951a64f09865171d2d7a502b1\` FOREIGN KEY (\`usersId\`) REFERENCES \`mytest\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`users_roles_roles\` ADD CONSTRAINT \`FK_b2f0366aa9349789527e0c36d97\` FOREIGN KEY (\`rolesId\`) REFERENCES \`mytest\`.\`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`mytest\`.\`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`mytest\`.\`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`books\` ADD CONSTRAINT \`FK_bb8627d137a861e2d5dc8d1eb20\` FOREIGN KEY (\`userId\`) REFERENCES \`mytest\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_b392510e8a9898d395a871bd9cf\` FOREIGN KEY (\`userId\`) REFERENCES \`mytest\`.\`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_98973d612b97d87f64b4afabe87\` FOREIGN KEY (\`accountId\`) REFERENCES \`mytest\`.\`accounts\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_9237a6e731418bb2b6111d17fb1\` FOREIGN KEY (\`categoryId\`) REFERENCES \`mytest\`.\`categories\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`records\` ADD CONSTRAINT \`FK_15234590e36c4749649986701f1\` FOREIGN KEY (\`bookId\`) REFERENCES \`mytest\`.\`books\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_e6c5511ddffe47a376a85bcbf6a\` FOREIGN KEY (\`templateId\`) REFERENCES \`mytest\`.\`account_templates\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_4f4a464da158dd4e3f6184b749f\` FOREIGN KEY (\`bookId\`) REFERENCES \`mytest\`.\`books\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`accounts\` ADD CONSTRAINT \`FK_3aa23c0a6d107393e8b40e3e2a6\` FOREIGN KEY (\`userId\`) REFERENCES \`mytest\`.\`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
