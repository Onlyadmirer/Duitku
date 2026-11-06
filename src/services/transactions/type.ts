export type addTransactionType = {
  walletId: number
  categoryId: number
  amount: number
  type: "income" | "expense"
  note?: string
  date: string
}

export type listTransactionType = {
  categoryId?: number | undefined;
  search?: string | undefined;
  type?: "income" | "expense" | undefined;
  walletId?: number | undefined;
  from?: string | undefined;
  to?: string | undefined;
  limit: number;
  page: number;
}

export type updateTransactionType = {
  date?: string | undefined;
  categoryId?: number | undefined;
  walletId?: number | undefined;
  amount?: number | undefined;
  note?: string | undefined;
}