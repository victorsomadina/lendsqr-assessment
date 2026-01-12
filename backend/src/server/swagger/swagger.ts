import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./docs.json";

export const registerSwaggerRoute = (app: Application) => {
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
