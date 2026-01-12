
export interface CreateWalletDto {
  userId: string;
  accountNumber: string;
  balance?: number;
  currency?: string;
}