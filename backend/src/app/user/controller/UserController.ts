import { Request, Response } from "express";
import { Service } from "typedi";
import { SignupInput } from "../inputs/SignupInputs";
import { LoginInput } from "../inputs/LoginInputs";
import { FundAccountInput, TransferFundsInput, WithdrawFundsInput } from "../inputs/WalletInputs";
import { UserService } from "../services/UserService";
import { WalletService } from "../services/WalletService";
import { AuthRequest } from "../../../middleware/AuthMiddleware";

@Service()
export class UserController {
    constructor(
        private userService: UserService,
        private walletService: WalletService
    ) { }

    async signup(req: Request, res: Response): Promise<Response> {
        try {
            const input: SignupInput = req.body;

            input.email = input.email?.trim().toLowerCase();
            input.firstName = input.firstName?.trim();
            input.lastName = input.lastName?.trim();

            if (!input.email || !input.password || !input.firstName || !input.lastName) {
                return res.status(400).json({
                    status: "error",
                    message: "All fields are required (email, password, firstName, lastName)",
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.email)) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid email format",
                });
            }

            if (input.password.length < 6) {
                return res.status(400).json({
                    status: "error",
                    message: "Password must be at least 6 characters long",
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

    async login(req: Request, res: Response): Promise<Response> {
        try {
            const input: LoginInput = req.body;

            input.email = input.email?.trim().toLowerCase();

            if (!input.email || !input.password) {
                return res.status(400).json({
                    status: "error",
                    message: "Email and password are required",
                });
            }

            const { user, token } = await this.userService.login(input);
            const { password, ...userResponse } = user;

            return res.status(200).json({
                status: "success",
                message: "Login successful",
                data: {
                    user: userResponse,
                    token,
                },
            });
        } catch (error: any) {
            return res.status(401).json({
                status: "error",
                message: error.message,
            });
        }
    }

    async fund(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const input: FundAccountInput = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized",
                });
            }

            if (!input.amount) {
                return res.status(400).json({
                    status: "error",
                    message: "amount is required",
                });
            }

            const wallet = await this.walletService.fundAccount(userId, input.amount);

            return res.status(200).json({
                status: "success",
                message: "Wallet funded successfully",
                data: wallet,
            });
        } catch (error: any) {
            return res.status(error.message.includes("found") ? 404 : 400).json({
                status: "error",
                message: error.message,
            });
        }
    }

    async transfer(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const input: TransferFundsInput = req.body;
            const senderId = req.user?.userId;

            if (!senderId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized",
                });
            }

            if (!input.recipientAccountNumber || !input.amount) {
                return res.status(400).json({
                    status: "error",
                    message: "recipientAccountNumber and amount are required",
                });
            }

            const transaction = await this.walletService.transferFunds(senderId, input);

            return res.status(200).json({
                status: "success",
                message: "Funds transferred successfully",
                data: transaction,
            });
        } catch (error: any) {
            const status = error.message.includes("insufficient funds") || error.message.includes("cannot transfer to self") ? 400 :
                error.message.includes("recipient not found") ? 404 : 500;
            return res.status(status).json({
                status: "error",
                message: error.message,
            });
        }
    }

    async withdraw(req: AuthRequest, res: Response): Promise<Response> {
        try {
            const input: WithdrawFundsInput = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    status: "error",
                    message: "Unauthorized",
                });
            }

            if (!input.amount) {
                return res.status(400).json({
                    status: "error",
                    message: "amount is required",
                });
            }

            const transaction = await this.walletService.withdrawFunds(userId, input);

            return res.status(200).json({
                status: "success",
                message: "Funds withdrawn successfully",
                data: transaction,
            });
        } catch (error: any) {
            return res.status(error.message.includes("insufficient") ? 400 : 500).json({
                status: "error",
                message: error.message,
            });
        }
    }
}
