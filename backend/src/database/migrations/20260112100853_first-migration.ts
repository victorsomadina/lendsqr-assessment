import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.string("id", 26).primary();
    table.string("firstName", 100).notNullable();
    table.string("lastName", 100).notNullable();
    table.string("email", 255).notNullable().unique();
    table.string("password", 255).notNullable();
    table.string("phone", 20).nullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable("wallets", (table) => {
    table.string("id", 26).primary();
    table.string("userId", 26).notNullable().unique();
    table.string("accountNumber", 20).notNullable().unique();
    table.decimal("balance", 15, 2).notNullable().defaultTo(0);
    table.string("currency", 3).notNullable().defaultTo("NGN");
    table.timestamps(true, true);

    table.foreign("userId").references("id").inTable("users").onDelete("CASCADE");
  });

  await knex.schema.createTable("transactions", (table) => {
    table.string("id", 26).primary();
    table.string("reference", 50).notNullable().unique();
    table.decimal("amount", 15, 2).notNullable();
    table.enum("transactionType", ["funding", "withdrawal", "transfer", "loan"]).notNullable();
    table.enum("status", ["pending", "completed", "failed"]).notNullable().defaultTo("pending");
    table.string("description", 255).nullable();
    table.string("senderWalletId", 26).nullable();
    table.string("receiverWalletId", 26).nullable();
    table.timestamps(true, true);

    table.foreign("senderWalletId").references("id").inTable("wallets").onDelete("SET NULL");
    table.foreign("receiverWalletId").references("id").inTable("wallets").onDelete("SET NULL");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("transactions");
  await knex.schema.dropTableIfExists("wallets");
  await knex.schema.dropTableIfExists("users");
}