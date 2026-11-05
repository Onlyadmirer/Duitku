import { db } from "@/db/client";
import { addBudgetsType } from "./types";
import { budgets, categories } from "@/db/schema";
import { eq } from "drizzle-orm";

export const addBudgets = async (data: addBudgetsType) => {
  return await db.insert(budgets).values(data).onConflictDoUpdate({
    target: [budgets.categoryId, budgets.month],
    set: { limitAmount: data.limitAmount }
  }).returning()
}

export const listBudgets = async (date: string) => {
  return await db.select()
    .from(budgets)
    .where(eq(budgets.month, date))
    .innerJoin(categories, eq(
      budgets.categoryId, categories.id
    ))
    .groupBy(budgets.id, categories.id)
}

export const removeBudget = async (id: number) => {
  await db.delete(budgets).where(eq(
    budgets.id, id
  ))
}