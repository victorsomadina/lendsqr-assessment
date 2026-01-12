import { TransactionType } from "../entities/Transaction";

export interface CreateTransactionDto {
  amount: number;
  transactionType: TransactionType;
  description?: string;
  senderWalletId?: string;
  receiverWalletId?: string;
}