import { Request, Response } from "express";
import { Service } from "typedi";
import { SignupInput } from "../inputs/SignupInputs";
import { UserService } from "../services/UserService";

@Service()
export class UserController {
    constructor(private userService: UserService) { }

    async signup(req: Request, res: Response): Promise<Response> {
        try {
            const input: SignupInput = req.body;

            if (!input.email || !input.password || !input.firstName || !input.lastName) {
                return res.status(400).json({
                    status: "error",
                    message: "All fields are required (email, password, firstName, lastName)",
                });
            }

            const user = await this.userService.createAccount(input);

            const { password, ...userResponse } = user;

            return res.status(201).json({
                status: "success",
                message: "User account created successfully",
                data: userResponse,
            });
        } catch (error: any) {
            return res.status(error.message.includes("exists") || error.message.includes("blacklist") ? 400 : 500).json({
                status: "error",
                message: error.message,
            });
        }
    }
}
