import { db } from "@/db/client";
import {
  addTransactionType,
  listTransactionType,
  updateTransactionType,
} from "./type";
import { categories, transactions, wallets } from "@/db/schema";
import { and, desc, eq, gte, like, lt, lte, or } from "drizzle-orm";

export const fetchTransactions = async (query: listTransactionType) => {
  const conditions = [];

  if (query.type) {
    conditions.push(eq(transactions.type, query.type));
  }
  if (query.walletId) {
    conditions.push(eq(transactions.walletId, query.walletId));
  }
  if (query.from) {
    conditions.push(gte(transactions.date, query.from));
  }
  if (query.to) {
    conditions.push(
      query.to.endsWith("-01") && query.from?.endsWith("-01")
        ? lt(transactions.date, query.to)
        : lte(transactions.date, query.to)
    );
  }
  if (query.search && query.search.trim() !== "") {
    const keyword = `%${query.search.trim()}%`;
    conditions.push(
      or(like(transactions.note, keyword), like(categories.name, keyword))
    );
  }
  if (query.categoryId) {
    conditions.push(eq(transactions.categoryId, query.categoryId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const promiseItem = db
    .select({
      id: transactions.id,
      walletId: transactions.walletId,
      categoryId: transactions.categoryId,
      amount: transactions.amount,
      type: transactions.type,
      note: transactions.note,
      date: transactions.date,
      createdAt: transactions.createdAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      walletName: wallets.name,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(wallets, eq(transactions.walletId, wallets.id))
    .where(whereClause)
    .orderBy(desc(transactions.date), desc(transactions.createdAt))
    .limit(query.limit)
    .offset((query.page - 1) * query.limit);

  const countRowsPromise = db
    .select({ id: transactions.id })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(whereClause);

  const [items, countRows] = await Promise.all([promiseItem, countRowsPromise]);

  return {
    items,
    total: countRows.length,
    page: query.page,
    limit: query.limit,
  };
};

export const addTransaction = async (data: addTransactionType) => {
  const [row] = await db.insert(transactions).values(data).returning();

  return row;
};

export const getOneTransaction = async (id: number) => {
  const [transaction] = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id));

  return transaction;
};

export const transactionUpdate = async (
  id: number,
  data: updateTransactionType
) => {
  const [transaction] = await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id))
    .returning();

  return transaction;
};

export const removeTransaction = async (id: number) => {
  await db.delete(transactions).where(eq(transactions.id, id));
};
