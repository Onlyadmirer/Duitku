
import {
  index,
  integer,
  sqliteTable,
  text,
  unique,
} from "drizzle-orm/sqlite-core";


// ==============================
// Wallets
// ==============================

export const wallets = sqliteTable("wallets", {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  initialBalance: integer("initial_balance").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ==============================
// Categories
// ==============================

export const categories = sqliteTable("categories", {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["income", "expense"],
  }).notNull(),
  color: text("color").notNull().default("#6366f1"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ==============================
// Transactions
// ==============================

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    walletId: integer("wallet_id")
      .notNull()
      .references(() => wallets.id),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id),
    amount: integer("amount").notNull(),
    type: text("type", {
      enum: ["income", "expense"],
    }).notNull(),
    note: text("note"),
    date: text("date").notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    index("transaction_date_idx").on(table.date),
    index("transaction_wallet_idx").on(table.walletId),
    index("transaction_category_idx").on(table.categoryId),
  ],
);

// ==============================
// App metadata
// ==============================

/**
 * Menyimpan flag internal aplikasi (mis. seed kategori sudah dijalankan).
 * Bukan pengganti tabel user/auth.
 */
export const appMeta = sqliteTable("app_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
});


// ==============================
// Budgets
// ==============================

export const budgets = sqliteTable(
  "budgets",
  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, {
        onDelete: "cascade",
      }),

    // Format: YYYY-MM
    month: text("month").notNull(),

    limitAmount: integer("limit_amount").notNull(),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("budgets_category_month_uq").on(
      table.categoryId,
      table.month,
    ),
  ],
);


export type Wallets = typeof wallets.$inferSelect;
export type Transactions = typeof transactions.$inferSelect;
export type Budgets = typeof budgets.$inferSelect;
export type Categories = typeof categories.$inferSelect;