import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { ulid } from "ulid";
import { BaseEntity } from "../../../common/entities/BaseEntity";
import { Wallet } from "./Wallet";

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

@Entity()
export class Transaction extends BaseEntity {
  @Column({ unique: true })
  reference!: string;

  @Column("decimal", { precision: 15, scale: 2 })
  amount!: number;

  @Column({
    type: "enum",
    enum: TransactionType,
  })
  transactionType!: TransactionType;

  @Column({
    type: "enum",
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  senderWalletId?: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.sentTransactions, { nullable: true })
  @JoinColumn({ name: "senderWalletId" })
  senderWallet?: Wallet;

  @Column({ nullable: true })
  receiverWalletId?: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.receivedTransactions, { nullable: true })
  @JoinColumn({ name: "receiverWalletId" })
  receiverWallet?: Wallet;

  @BeforeInsert()
  generateReference() {
    if (!this.reference) {
      this.reference = `TXN-${ulid()}`;
    }
  }
}

