import {MigrationInterface, QueryRunner} from "typeorm";

export class migration1768208322187 implements MigrationInterface {
    name = 'migration1768208322187'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`firstName\` varchar(255) NOT NULL, \`lastName\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`phone\` varchar(255) NULL, UNIQUE INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`wallet\` (\`id\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`accountNumber\` varchar(255) NOT NULL, \`balance\` decimal(15,2) NOT NULL DEFAULT '0.00', \`currency\` varchar(255) NOT NULL DEFAULT 'NGN', \`userId\` varchar(255) NOT NULL, UNIQUE INDEX \`IDX_eade8556fd57a767e7905e68da\` (\`accountNumber\`), UNIQUE INDEX \`REL_35472b1fe48b6330cd34970956\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`transaction\` (\`id\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`reference\` varchar(255) NOT NULL, \`amount\` decimal(15,2) NOT NULL, \`transactionType\` enum ('funding', 'withdrawal', 'transfer', 'loan') NOT NULL, \`status\` enum ('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending', \`description\` varchar(255) NULL, \`senderWalletId\` varchar(255) NULL, \`receiverWalletId\` varchar(255) NULL, UNIQUE INDEX \`IDX_0b12a144bdc7678b6ddb0b913f\` (\`reference\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`wallet\` ADD CONSTRAINT \`FK_35472b1fe48b6330cd349709564\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_3f062ad5434ca2ce2a1fc4e9494\` FOREIGN KEY (\`senderWalletId\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`transaction\` ADD CONSTRAINT \`FK_4d3780cb30b7e2f7949689e3b56\` FOREIGN KEY (\`receiverWalletId\`) REFERENCES \`wallet\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_4d3780cb30b7e2f7949689e3b56\``);
        await queryRunner.query(`ALTER TABLE \`transaction\` DROP FOREIGN KEY \`FK_3f062ad5434ca2ce2a1fc4e9494\``);
        await queryRunner.query(`ALTER TABLE \`wallet\` DROP FOREIGN KEY \`FK_35472b1fe48b6330cd349709564\``);
        await queryRunner.query(`DROP INDEX \`IDX_0b12a144bdc7678b6ddb0b913f\` ON \`transaction\``);
        await queryRunner.query(`DROP TABLE \`transaction\``);
        await queryRunner.query(`DROP INDEX \`REL_35472b1fe48b6330cd34970956\` ON \`wallet\``);
        await queryRunner.query(`DROP INDEX \`IDX_eade8556fd57a767e7905e68da\` ON \`wallet\``);
        await queryRunner.query(`DROP TABLE \`wallet\``);
        await queryRunner.query(`DROP INDEX \`IDX_e12875dfb3b1d92d7d7c5377e2\` ON \`user\``);
        await queryRunner.query(`DROP TABLE \`user\``);
    }

}
