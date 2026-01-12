import { Application, Router } from "express";
import { Container } from "typedi";
import { UserController } from "../app/user/controller/UserController";
import { AuthMiddleware } from "../middleware/AuthMiddleware";

export const registerAPIRoutes = (app: Application) => {
    const router = Router();

    const userController = Container.get(UserController);

    router.post("/signup", (req, res) => userController.signup(req, res));
    router.post("/login", (req, res) => userController.login(req, res));

    router.post("/fund", AuthMiddleware, (req, res) => userController.fund(req, res));
    router.post("/transfer", AuthMiddleware, (req, res) => userController.transfer(req, res));
    router.post("/withdraw", AuthMiddleware, (req, res) => userController.withdraw(req, res));

    app.use("/api", router);
};
