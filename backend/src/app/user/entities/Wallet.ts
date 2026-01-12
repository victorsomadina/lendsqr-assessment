import { Column, Entity, JoinColumn, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/BaseEntity";
import { User } from "./User";
import { Transaction } from "./Transaction";

@Entity()
export class Wallet extends BaseEntity {
  @Column({ unique: true })
  accountNumber!: string;

  @Column("decimal", { precision: 15, scale: 2, default: 0 })
  balance!: number;

  @Column({ default: "NGN" })
  currency!: string;

  @Column()
  userId!: string;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn({ name: "userId" })
  user!: User;

  @OneToMany(() => Transaction, (transaction) => transaction.senderWallet)
  sentTransactions?: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.receiverWallet)
  receivedTransactions?: Transaction[];
}