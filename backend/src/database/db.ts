import knex, { Knex } from "knex";
import { Container } from "typedi";
import { Config } from "../config/Config";

const db: Knex = knex(Config.db);

Container.set("database", db);

export default db;
