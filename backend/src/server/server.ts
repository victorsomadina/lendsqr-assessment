import "dotenv/config";
import { default as Express, Request, Response } from "express";
import { createServer } from "http";
import "reflect-metadata";
import { registerSwaggerRoute } from "./swagger/swagger";
import db from "../database/db";
import { registerAPIRoutes } from "../routes";
import cors from "cors";

const main = async () => {
  try {
    await db.raw("SELECT 1");
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("Failed to connect to the database:", error);
    process.exit(1);
  }

  const app = Express();

  app.use(Express.json());
  app.use(cors());

  registerAPIRoutes(app);

  registerSwaggerRoute(app);

  app.get("/", (_req: Request, res: Response) => {
    res.send("Lendsqr Assessment API");
  });
  const httpServer = createServer(app);

  const port = process.env.PORT || 3500;

  httpServer.listen({ port }, () => {
    console.log(
      `API server ready and listening at ==> http://localhost:${port}/api`
    );
    console.log(
      `API server ready and listening at ==> http://localhost:${port}/docs`
    );
  });
};

main().catch((error) => {
  console.log(error, "error");
});
