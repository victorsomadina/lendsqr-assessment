import { ConnectionOptions } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const dbConnectionOptions: ConnectionOptions = {
  type: "mysql",
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USERNAME ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_DATABASE ?? "lendsqr_wallet",
  synchronize: false,
};

export const Config = {
  db: {
    sql: dbConnectionOptions,
  },
  jwtSecret: process.env.JWT_SECRET,
  port: Number(process.env.PORT) || 3000,
};
