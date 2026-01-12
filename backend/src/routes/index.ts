import { Application, Router } from "express";
import { Container } from "typedi";
import { UserController } from "../app/user/controller/UserController";

export const registerAPIRoutes = (app: Application) => {
    const router = Router();

    const userController = Container.get(UserController);

    router.post("/signup", (req, res) => userController.signup(req, res));

    app.use("/api", router);
};
