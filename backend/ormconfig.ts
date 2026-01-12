import { Config } from "./src/config/Config";

export default {
  ...Config.db.sql,
  synchronize: false,
  logging: false,
  entities: ["./src/**/entities/**/*.{ts,js}"],
  migrations: ["./src/database/migrations/*.{ts,js}"],
  migrationsRun: false,
  cli: {
    migrationsDir: "./src/database/migrations",
  },
};
