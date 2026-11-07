import { db } from "@/db/client";
import { monthFormatter } from "./plugin";
import { budgets, categories, transactions, wallets } from "@/db/schema";
import { and, eq, gte, lt, sql } from "drizzle-orm";

export const summary = async (date: string) => {
  const { start, end } = monthFormatter(date);

  // monthly transaction
  const monthlyTotals = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
        Number
      ),
      count: sql<number>`count(${transactions.id})`.mapWith(Number),
    })
    .from(transactions)
    .where(and(gte(transactions.date, start), lt(transactions.date, end)))
    .groupBy(transactions.type);

  const expenseRow = monthlyTotals.find((item) => item.type === "expense");
  const incomeRow = monthlyTotals.find((item) => item.type === "income");

  const expense = Number(expenseRow?.total ?? 0);
  const income = Number(incomeRow?.total ?? 0);
  const expenseCount = Number(expenseRow?.count ?? 0);
  const incomeCount = Number(incomeRow?.count ?? 0);
  const net = income - expense;

  // all time transaction
  const allTimeTransaction = await db
    .select({
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
        Number
      ),
    })
    .from(transactions)
    .groupBy(transactions.type);

  const [walletTotalAmount] = await db
    .select({
      total: sql<number>`coalesce(sum(${wallets.initialBalance}), 0)`.mapWith(
        Number
      ),
    })
    .from(wallets);

  const totalExpense = Number(
    allTimeTransaction.find((item) => item.type === "expense")?.total ?? 0
  );

  const totalIncome = Number(
    allTimeTransaction.find((item) => item.type === "income")?.total ?? 0
  );

  const balance =
    (walletTotalAmount?.total ?? 0) + totalIncome - totalExpense;

  return {
    date,
    income,
    expense,
    incomeCount,
    expenseCount,
    net,
    balance,
  };
};

export const byCategory = async (month: string) => {
  const { start, end } = monthFormatter(month);

  const datas = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      limit: budgets.limitAmount,
      spent: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
        Number
      ),
    })
    .from(categories)
    .leftJoin(
      budgets,
      and(eq(categories.id, budgets.categoryId), eq(budgets.month, month))
    )
    .leftJoin(
      transactions,
      and(
        eq(categories.id, transactions.categoryId),
        eq(transactions.type, "expense"),
        gte(transactions.date, start),
        lt(transactions.date, end)
      )
    )
    .where(eq(categories.type, "expense"))
    .groupBy(categories.id, budgets.limitAmount);

  const items = datas.map((data) => {
    if (data.limit === null) {
      return {
        ...data,
        limit: null,
        percent: 0,
        remaining: 0,
        status: "tanpa anggaran" as const,
      };
    }

    const percent = data.limit > 0 ? (data.spent * 100) / data.limit : 0;
    const remaining = data.limit - data.spent;

    let status: "melebihi" | "habis" | "hampir habis" | "aman";

    if (data.spent > data.limit) {
      status = "melebihi";
    } else if (data.limit === data.spent && data.limit > 0) {
      status = "habis";
    } else if (percent >= 80) {
      status = "hampir habis";
    } else {
      status = "aman";
    }

    return {
      ...data,
      percent,
      remaining,
      status,
    };
  });

  return {
    month,
    items,
  };
};

export const monthlyTrends = async (year: number) => {
  const monthExpr = sql<string>`substr(${transactions.date}, 1, 7)`;

  const datas = await db
    .select({
      month: monthExpr,
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}), 0)`.mapWith(
        Number
      ),
    })
    .from(transactions)
    .where(
      and(
        gte(transactions.date, `${year}-01-01`),
        lt(transactions.date, `${year + 1}-01-01`)
      )
    )
    .groupBy(monthExpr, transactions.type)
    .orderBy(monthExpr);

  const months = Array.from({ length: 12 }, (_, i) => ({
    month: `${year}-${String(i + 1).padStart(2, "0")}`,
    income: 0,
    expense: 0,
    net: 0,
  }));

  for (const data of datas) {
    const index = Number(data.month.slice(5, 7)) - 1;
    if (index >= 0 && index < 12) {
      if (data.type === "expense") {
        months[index].expense = Number(data.total);
      } else if (data.type === "income") {
        months[index].income = Number(data.total);
      }
      months[index].net = months[index].income - months[index].expense;
    }
  }

  return {
    year,
    data: months,
  };
};

export const walletBalances = async () => {
  const datas = await db
    .select({
      id: wallets.id,
      name: wallets.name,
      initialBalance: wallets.initialBalance,
      income: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
      expense: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`.mapWith(
        Number
      ),
    })
    .from(wallets)
    .leftJoin(transactions, eq(wallets.id, transactions.walletId))
    .groupBy(wallets.id);

  return datas.map((data) => ({
    id: data.id,
    name: data.name,
    initialBalance: data.initialBalance,
    income: data.income,
    expense: data.expense,
    balance: data.initialBalance + data.income - data.expense,
  }));
};
