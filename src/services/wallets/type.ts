export type createWalletType = {
  name: string;
  initialBalance: number;
};

export type updateWalletType = {
  name: string;
  initialBalance: number;
};

export type transferWalletType = {
  fromWalletId: number;
  toWalletId: number;
  amount: number;
  adminFee?: number;
  note?: string;
  date?: string;
};