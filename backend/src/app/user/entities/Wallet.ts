import { BaseEntity } from "../../../common/entities/BaseEntity";

export interface Wallet extends BaseEntity {
  userId: string;
  accountNumber: string;
  balance: number;
  currency: string;
}