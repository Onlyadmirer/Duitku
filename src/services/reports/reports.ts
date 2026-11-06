import { db } from "@/db/client"
import { monthFormatter } from "./plugin"
import { budgets, categories, transactions, wallets } from "@/db/schema"
import { and, eq, gte, lt, sql, sum } from "drizzle-orm"

export const summary = async (date: string) => {
  const { start, end } = monthFormatter(date)

  // monthly transaction
  const monthlyTotals = await db.select({
    type: transactions.type,
    total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
  }).from(transactions)
    .where(and(
      gte(transactions.date, start),
      lt(transactions.date, end)
    )).groupBy(transactions.type)


  const expense = Number(monthlyTotals.find(item => {
    item.type === "expense"
  })?.total ?? "0")


  const income = Number(monthlyTotals.find(item => {
    item.type === "income"
  })?.total ?? "0")

  const net = income - expense


  // all time transaction
  const allTimeTransaction = await db.select({
    type: transactions.type,
    total: sum(transactions.amount)
  }).from(transactions)
    .groupBy(transactions.type)

  const [walletTotalAmount] = await db.select({
    total: sql<number>`coalesce(sum(${wallets.initialBalance}), 0)`.mapWith(Number)
  }).from(wallets)

  const TotalExpense = Number(allTimeTransaction.find(item => {
    item.type === "expense"
  })?.total ?? "0")


  const TotalIncome = Number(allTimeTransaction.find(item => {
    item.type === "income"
  })?.total ?? "0")

  const balance = walletTotalAmount.total + TotalIncome - TotalExpense

  return {
    date: date,
    income: income,
    expense: expense,
    net: net,
    balance: balance
  }

}


export const byCategory = async (month: string) => {
  const datas = await db.select({
    name: categories.name,
    color: categories.color,
    limit: budgets.limitAmount,
    spent: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(Number)
  }).from(categories)
    .leftJoin(transactions, eq(categories.id, transactions.categoryId))
    .leftJoin(budgets, eq(categories.id, budgets.categoryId))
    .where(and(
      eq(categories.type, "expense")
    ))
    .groupBy(categories.id, budgets.limitAmount)


  const items = datas.map(data => {
    if (data.limit === null) {
      return {
        ...data,
        limit: null,
        spent: "tanpa anggaran"
      }
    }

    const percent = data.spent * 100 / data.limit
    const remaining = data.limit - data.spent

    let status: string

    if (data.limit > data.spent) {
      status = "melebihi"
    } else if (percent >= 80) {
      status = "hampir habis"
    } else if (data.limit === data.spent) {
      status = "habis"
    } else {
      status = "aman"
    }

    return {
      ...data,
      percent,
      remaining,
      status
    }
  })

  return {
    month,
    items
  }

}

export const monthlyTrends = async (year: number) => {

  const datas = await db.select({
    month: sql<string>`to_char(${transactions.date}, "YYYY-MM")`,
    type: transactions.type,
    total: sql<number>`coalesce(sum(${transactions.amount}), '0')`
  }).from(transactions)
    .where(and(
      gte(transactions.date, `${year}-01-01`),
      lt(transactions.date, `${year + 1}-01-01`)
    ))
    .groupBy(
      sql<string>`to_char(${transactions.date}, "YYYY-MM")`,
      transactions.type
    )
    .orderBy(
      sql<string>`to_char(${transactions.date}, "YYYY-MM")`
    )

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    income: 0,
    expense: 0,
    net: 0
  }))

  for (const data of datas) {
    const index = Number(data.month.slice(5, 7)) - 1

    if (data.type === "expense") {
      months[index].expense = data.total
    } else if (data.type === "income") {
      months[index].income = data.total
    }

    months[index].net = months[index].income - months[index].expense
  }

  return {
    year: year,
    data: months
  }
}

export const walletBalances = async () => {
  const datas = await db.select({
    id: wallets.id,
    name: wallets.name,
    initialBalance: wallets.initialBalance,
    type: transactions.type,
    total: sql<number>`coalesce(sum(${transactions.amount}), '0')`.mapWith(Number)
  }).from(wallets)
    .leftJoin(transactions, eq(wallets.id, transactions.walletId))
    .groupBy(
      wallets.id,
      transactions.type
    )

  const items = datas.map(data => {
    let income = 0
    let expense = 0


    if (data.type === "income") {
      income = data.total
    } else if (data.type === "expense") {
      expense = data.total
    }

    const balance = data.initialBalance + income - expense

    return {
      id: data.id,
      name: data.name,
      initialBalance: data.initialBalance,
      income: income,
      expense: expense,
      balance: balance
    }
  })
}