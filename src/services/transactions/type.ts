export type addTransactionType = {
  walletId: number
  categoryId: number
  amount: number
  type: "income" | "expense"
  note?: string
  date: string
}