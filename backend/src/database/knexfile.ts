import type { Knex } from "knex";
import { Config } from "../config/Config";

const knexConfig: Knex.Config = {
    client: Config.db.client,
    connection: Config.db.connection,
    migrations: {
        directory: "./migrations",
        extension: "ts",
    },
    seeds: {
        directory: "./seeds",
    },
};

module.exports = knexConfig;
export default knexConfig;
