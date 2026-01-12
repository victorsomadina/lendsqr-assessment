import { BaseEntity } from "../../../common/entities/BaseEntity";

export enum TransactionType {
  FUNDING = "funding",
  WITHDRAWAL = "withdrawal",
  TRANSFER = "transfer",
  LOAN = "loan",
}

export enum TransactionStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export interface Transaction extends BaseEntity {
  reference: string;
  amount: number;
  transactionType: TransactionType;
  status: TransactionStatus;
  description?: string;
  senderWalletId?: string;
  receiverWalletId?: string;
}


