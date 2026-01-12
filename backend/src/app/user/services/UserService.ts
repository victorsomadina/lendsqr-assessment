import bcrypt from "bcryptjs";
import { Knex } from "knex";
import { Inject, Service } from "typedi";
import { ulid } from "ulid";
import { User } from "../entities/User";
import { SignupInput } from "../inputs/SignupInputs";
import { LoginInput } from "../inputs/LoginInputs";
import { AdjutorService } from "./AdjutorService";

@Service()
export class UserService {
    constructor(
        @Inject("database") private db: Knex,
        private adjutorService: AdjutorService
    ) { }

    async createAccount(input: SignupInput): Promise<User & { accountNumber: string }> {
        const existing = await this.db<User>("users").where({ email: input.email }).first();
        if (existing) {
            throw new Error("A user with this email already exists.");
        }

        const blacklisted = await this.adjutorService.isBlacklisted(input.email);
        if (blacklisted) {
            throw new Error("Your account cannot be created at this time based on credit history.");
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const userId = ulid();
        const walletId = ulid();

        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const [newUser] = await this.db.transaction(async (trx) => {
            await trx("users").insert({
                id: userId,
                firstName: input.firstName,
                lastName: input.lastName,
                email: input.email,
                password: hashedPassword,
                phone: input.phone,
                created_at: new Date(),
                updated_at: new Date(),
            });

            await trx("wallets").insert({
                id: walletId,
                userId: userId,
                accountNumber: accountNumber,
                balance: 0,
                currency: "NGN",
                created_at: new Date(),
                updated_at: new Date(),
            });

            return trx<User>("users").where({ id: userId }).select();
        });

        return { ...newUser, accountNumber };
    }

    async login(input: LoginInput): Promise<{ user: User; token: string }> {
        const user = await this.db<User>("users").where({ email: input.email }).first();
        if (!user) {
            throw new Error("Invalid email or password.");
        }

        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) {
            throw new Error("Invalid email or password.");
        }

        const token = require("jwt-simple").encode(
            { userId: user.id, email: user.email, iat: Date.now() },
            process.env.JWT_SECRET || "default_secret"
        );

        return { user, token };
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return this.db<User>("users").where({ email }).first();
    }
}
