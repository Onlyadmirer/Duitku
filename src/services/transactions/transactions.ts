import { db } from "@/db/client"
import { addTransactionType } from "./type"
import { transactions } from "@/db/schema"
import { desc } from "drizzle-orm"


export const fetchTransactions = async () => {
  return await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
}

export const addTransaction = async (data: addTransactionType) => {
  const [row] = await db.insert(transactions)
    .values(data).returning()

  return row
}