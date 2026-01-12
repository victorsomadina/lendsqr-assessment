import * as dotenv from "dotenv";
import * as path from "path";

const envPath = path.join(__dirname, "../../.env");
dotenv.config({ path: envPath });

export const Config = {
  db: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST ?? "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USERNAME ?? "root",
      password: process.env.DB_PASSWORD ?? "",
      database: process.env.DB_DATABASE ?? "lendsqr_wallet",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "./src/database/migrations",
      extension: "ts",
    },
    seeds: {
      directory: "./src/database/seeds",
    },
  },
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT) || 3000,
};
