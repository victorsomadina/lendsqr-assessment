import knex, { Knex } from "knex";
import { Config } from "../config/Config";

const db: Knex = knex(Config.db);

export default db;
