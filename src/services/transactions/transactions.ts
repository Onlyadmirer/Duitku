import { db } from "@/db/client"
import { addTransactionType, listTransactionType, updateTransactionType } from "./type"
import { transactions } from "@/db/schema"
import { and, desc, eq, gte, ilike, lte } from "drizzle-orm"


export const fetchTransactions = async (query: listTransactionType) => {

  const conditions = []

  if (query.type) {
    conditions.push(eq(transactions.type, query.type))
  }

  if (query.from) {
    conditions.push(gte(transactions.date, query.from))
  }
  if (query.to) {
    conditions.push(lte(transactions.date, query.to))
  }
  if (query.search) {
    conditions.push(ilike(transactions.note, `%${query.search}%`))
  }
  if (query.categoryId) {
    conditions.push(eq(transactions.categoryId, query.categoryId))
  }

  const promiseItem = db.select().from(transactions)
    .where(and(...conditions)).orderBy(desc(transactions.date), desc(transactions.createdAt)).limit(query.limit).offset((query.page - 1) * query.limit)

  const totalPromise = db.$count(transactions, and(...conditions))

  const [items, total] = await Promise.all([promiseItem, totalPromise])

  return {
    items,
    total,
    page: query.page,
    limit: query.limit
  }
}

export const addTransaction = async (data: addTransactionType) => {
  const [row] = await db.insert(transactions)
    .values(data).returning()

  return row
}

export const getOneTransaction = async (id: number) => {
  const [transaction] = await db.select().from(transactions)
    .where(eq(transactions.id, id))

  return transaction
}

export const transactionUpdate = async (id: number, data: updateTransactionType) => {
  const [transaction] = await db.update(transactions).set(data)
    .where(eq(transactions.id, id)).returning()

  return transaction
}

export const removeTransaction = async (id: number) => {
  await db.delete(transactions).where(eq(transactions.id, id))
}