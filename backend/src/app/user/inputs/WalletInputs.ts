export interface FundAccountInput {
  amount: number;
}

export interface TransferFundsInput {
  recipientAccountNumber: string;
  amount: number;
}

export interface WithdrawFundsInput {
  amount: number;
}