import { Wallet } from "../../../src/app/user/entities/Wallet";
import { Transaction, TransactionType, TransactionStatus } from "../../../src/app/user/entities/Transaction";
import { ulid } from "ulid";

export class WalletFactory {
    static createWallet(overrides: Partial<Wallet> = {}): Wallet {
        return {
            id: ulid(),
            userId: ulid(),
            accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
            balance: 0,
            currency: "NGN",
            created_at: new Date(),
            updated_at: new Date(),
            ...overrides
        };
    }

    static createTransaction(overrides: Partial<Transaction> = {}): Transaction {
        return {
            id: ulid(),
            reference: `TXN-${ulid()}`,
            amount: 1000,
            transactionType: TransactionType.FUNDING,
            status: TransactionStatus.COMPLETED,
            description: "Test transaction",
            created_at: new Date(),
            updated_at: new Date(),
            ...overrides
        };
    }
}
