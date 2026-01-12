import { Knex } from "knex";
import { Inject, Service } from "typedi";
import { ulid } from "ulid";
import { Transaction } from "../entities/Transaction";
import { Wallet } from "../entities/Wallet";
import { TransferFundsInput, WithdrawFundsInput } from "../inputs/WalletInputs";

@Service()
export class WalletService {
    constructor(@Inject("database") private db: Knex) { }

    async fundAccount(userId: string, amount: number): Promise<Wallet> {
        if (amount <= 0) {
            throw new Error("Funding amount must be greater than zero.");
        }

        return await this.db.transaction(async (trx) => {
            const wallet = await trx<Wallet>("wallets")
                .where({ userId })
                .forUpdate()
                .first();

            if (!wallet) {
                throw new Error("Wallet not found for this user.");
            }

            const newBalance = Number(wallet.balance) + amount;
            await trx("wallets")
                .where({ id: wallet.id })
                .update({
                    balance: newBalance,
                    updated_at: new Date(),
                });

            const txnId = ulid();
            await trx("transactions").insert({
                id: txnId,
                reference: `TXN-${ulid()}`,
                amount: amount,
                transactionType: "funding",
                status: "completed",
                description: `Wallet funding of ${amount}`,
                receiverWalletId: wallet.id,
                created_at: new Date(),
                updated_at: new Date(),
            });

            return {
                ...wallet,
                balance: newBalance,
                updated_at: new Date(),
            };
        });
    }


    async getWalletByUserId(userId: string): Promise<Wallet | undefined> {
        return this.db<Wallet>("wallets").where({ userId }).first();
    }

    async transferFunds(senderId: string, input: TransferFundsInput): Promise<Transaction> {
        const { recipientAccountNumber, amount } = input;

        if (amount <= 0) {
            throw new Error("Transfer amount must be greater than zero.");
        }

        return await this.db.transaction(async (trx) => {
            const senderWallet = await trx<Wallet>("wallets")
                .where({ userId: senderId })
                .forUpdate()
                .first();

            if (!senderWallet) {
                throw new Error("Sender wallet not found.");
            }

            if (Number(senderWallet.balance) < amount) {
                throw new Error("Insufficient funds.");
            }

            const receiverWallet = await trx<Wallet>("wallets")
                .where({ accountNumber: recipientAccountNumber })
                .forUpdate()
                .first();

            if (!receiverWallet) {
                throw new Error("Recipient account not found.");
            }

            if (senderWallet.id === receiverWallet.id) {
                throw new Error("Cannot transfer to the same account.");
            }

            await trx("wallets")
                .where({ id: senderWallet.id })
                .update({
                    balance: Number(senderWallet.balance) - amount,
                    updated_at: new Date(),
                });

            await trx("wallets")
                .where({ id: receiverWallet.id })
                .update({
                    balance: Number(receiverWallet.balance) + amount,
                    updated_at: new Date(),
                });

            const txnId = ulid();
            const reference = `TXN-${ulid()}`;
            await trx("transactions").insert({
                id: txnId,
                reference,
                amount: amount,
                transactionType: "transfer",
                status: "completed",
                description: `Transfer of ${amount} to ${recipientAccountNumber}`,
                senderWalletId: senderWallet.id,
                receiverWalletId: receiverWallet.id,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const [transaction] = await trx<Transaction>("transactions").where({ id: txnId }).select();
            return transaction;
        });
    }

    async withdrawFunds(userId: string, input: WithdrawFundsInput): Promise<Transaction> {
        const { amount } = input;

        if (amount <= 0) {
            throw new Error("Withdrawal amount must be greater than zero.");
        }

        return await this.db.transaction(async (trx) => {
            const wallet = await trx<Wallet>("wallets")
                .where({ userId })
                .forUpdate()
                .first();

            if (!wallet) {
                throw new Error("Wallet not found.");
            }

            if (Number(wallet.balance) < amount) {
                throw new Error("Insufficient funds for withdrawal.");
            }

            const newBalance = Number(wallet.balance) - amount;
            await trx("wallets")
                .where({ id: wallet.id })
                .update({
                    balance: newBalance,
                    updated_at: new Date(),
                });

            const txnId = ulid();
            const reference = `TXN-${ulid()}`;
            await trx("transactions").insert({
                id: txnId,
                reference,
                amount: amount,
                transactionType: "withdrawal",
                status: "completed",
                description: `Withdrawal of ${amount}`,
                senderWalletId: wallet.id,
                created_at: new Date(),
                updated_at: new Date(),
            });

            const [transaction] = await trx<Transaction>("transactions").where({ id: txnId }).select();
            return transaction;
        });
    }
}
