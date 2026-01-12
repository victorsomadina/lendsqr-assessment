import { SignupInput } from "../../../src/app/user/inputs/SignupInputs";
import { User } from "../../../src/app/user/entities/User";
import { ulid } from "ulid";

export class UserFactory {
    static createSignupInput(overrides: Partial<SignupInput> = {}): SignupInput {
        return {
            firstName: "John",
            lastName: "Doe",
            email: `john.doe.${Date.now()}@example.com`,
            password: "password123",
            phone: "1234567890",
            ...overrides
        };
    }

    static createUser(overrides: Partial<User> = {}): User {
        return {
            id: ulid(),
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@example.com",
            password: "hashed_password",
            phone: "1234567890",
            created_at: new Date(),
            updated_at: new Date(),
            ...overrides
        };
    }
}
