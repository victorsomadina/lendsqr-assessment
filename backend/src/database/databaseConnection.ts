import "dotenv/config";
import "reflect-metadata";
import { createConnection, useContainer } from "typeorm";
import { Container } from "typeorm-typedi-extensions";
import { Config } from "../config/Config";

export const createDB = async () => {
  const options = {
    entities: [
      __dirname + "/../app/**/entities/**/*.{ts,js}",
      __dirname + "/../common/entities/**/*.{ts,js}",
    ],
    synchronize: false,
    logging: false,
    migrations: [__dirname + "/migrations/*.{ts,js}"],
    migrationRun: false,
    bigNumberStrings: false,
    ...Config.db.sql,
  };

  useContainer(Container);

  return createConnection(options);
};
