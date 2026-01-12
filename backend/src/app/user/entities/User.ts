import { Column, Entity, OneToOne } from "typeorm";
import { BaseEntity } from "../../../common/entities/BaseEntity";
import { Wallet } from "./Wallet";

@Entity()
export class User extends BaseEntity {
  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  wallet?: Wallet;
}