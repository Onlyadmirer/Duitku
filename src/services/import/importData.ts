import { File } from "expo-file-system";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/db/client";
import { budgets, categories, transactions, wallets } from "@/db/schema";
import { walletKeys } from "@/services/wallets/hooks/useWallets";
import { categoryKeys } from "@/services/categories/hooks/useCategories";
import { transactionKeys } from "@/services/transactions/hooks/useTransactions";
import { budgetKeys } from "@/services/budgets/hooks/useBudgets";
import { reportKeys } from "@/services/reports/hooks/useReports";

export interface DuitkuExportWallet {
  id: number;
  name: string;
  initialBalance: number;
  createdAt?: number | string;
}

export interface DuitkuExportCategory {
  id: number;
  name: string;
  type: "income" | "expense";
  color?: string;
  createdAt?: number | string;
}

export interface DuitkuExportTransaction {
  id: number;
  walletId: number;
  categoryId: number;
  amount: number;
  type: "income" | "expense";
  note?: string | null;
  date: string;
  createdAt?: number | string;
}

export interface DuitkuExportBudget {
  id: number;
  categoryId: number;
  month: string;
  limitAmount: number;
  createdAt?: number | string;
}

export interface DuitkuExportPayload {
  format: "duitku-export";
  version: number;
  exportedAt?: string;
  currency?: string;
  data: {
    wallets: DuitkuExportWallet[];
    categories: DuitkuExportCategory[];
    transactions: DuitkuExportTransaction[];
    budgets: DuitkuExportBudget[];
  };
}

export interface ValidatedDuitkuImport {
  payload: DuitkuExportPayload;
  fileName?: string;
  exportedAtLabel: string;
  walletsCount: number;
  categoriesCount: number;
  transactionsCount: number;
  budgetsCount: number;
}

const parseCreatedAtDate = (val: number | string | undefined): Date => {
  if (typeof val === "number" && Number.isFinite(val)) {
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (typeof val === "string" && val.trim() !== "") {
    const asNum = Number(val);
    if (Number.isFinite(asNum)) {
      const d = new Date(asNum);
      if (!Number.isNaN(d.getTime())) return d;
    }
    const d = new Date(val);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
};

const normalizeTxDate = (rawDate: string): string => {
  const trimmed = String(rawDate ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return new Date().toISOString().slice(0, 10);
};

export const validateDuitkuImportJson = (
  rawJson: string,
  fileName?: string
): ValidatedDuitkuImport => {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson.trim());
  } catch {
    throw new Error(
      "File bukan JSON yang valid. Pastikan kamu memilih file ekspor JSON dari Duitku."
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Struktur file JSON tidak dikenali.");
  }

  if (parsed.format !== "duitku-export") {
    throw new Error(
      'Format JSON tidak sesuai (wajib memiliki `"format": "duitku-export"`).'
    );
  }

  const data = parsed.data;
  if (!data || typeof data !== "object") {
    throw new Error("Properti `data` tidak ditemukan di dalam file JSON.");
  }

  const walletsArr = Array.isArray(data.wallets) ? data.wallets : null;
  const categoriesArr = Array.isArray(data.categories) ? data.categories : null;
  const transactionsArr = Array.isArray(data.transactions)
    ? data.transactions
    : [];
  const budgetsArr = Array.isArray(data.budgets) ? data.budgets : [];

  if (!walletsArr || !categoriesArr) {
    throw new Error(
      "Data `wallets` dan `categories` wajib berupa array di dalam file JSON."
    );
  }

  if (walletsArr.length === 0) {
    throw new Error("File JSON harus memiliki minimal 1 data dompet.");
  }

  if (categoriesArr.length === 0) {
    throw new Error("File JSON harus memiliki minimal 1 data kategori.");
  }

  // Validate wallet items
  for (const w of walletsArr) {
    if (
      typeof w?.id !== "number" ||
      typeof w?.name !== "string" ||
      !w.name.trim()
    ) {
      throw new Error(
        "Terdapat item dompet pada JSON yang tidak memiliki `id` atau `name` yang valid."
      );
    }
  }

  // Validate category items
  for (const c of categoriesArr) {
    if (
      typeof c?.id !== "number" ||
      typeof c?.name !== "string" ||
      !c.name.trim() ||
      (c?.type !== "income" && c?.type !== "expense")
    ) {
      throw new Error(
        "Terdapat item kategori pada JSON yang tidak memiliki `id`, `name`, atau `type` ('income'/'expense') yang valid."
      );
    }
  }

  let exportedAtLabel = "-";
  if (typeof parsed.exportedAt === "string" && parsed.exportedAt.trim()) {
    const d = new Date(parsed.exportedAt);
    exportedAtLabel = Number.isNaN(d.getTime())
      ? parsed.exportedAt
      : `${String(d.getDate()).padStart(2, "0")}/${String(
          d.getMonth() + 1
        ).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(
          2,
          "0"
        )}:${String(d.getMinutes()).padStart(2, "0")}`;
  }

  const payload: DuitkuExportPayload = {
    format: "duitku-export",
    version: Number(parsed.version ?? 1),
    exportedAt: parsed.exportedAt,
    currency: parsed.currency ?? "IDR",
    data: {
      wallets: walletsArr,
      categories: categoriesArr,
      transactions: transactionsArr,
      budgets: budgetsArr,
    },
  };

  return {
    payload,
    fileName,
    exportedAtLabel,
    walletsCount: walletsArr.length,
    categoriesCount: categoriesArr.length,
    transactionsCount: transactionsArr.length,
    budgetsCount: budgetsArr.length,
  };
};

export const pickAndValidateDuitkuJsonFile =
  async (): Promise<ValidatedDuitkuImport | null> => {
    const picked = await File.pickFileAsync({
      multipleFiles: false,
      mimeTypes: ["application/json", "text/*", "application/octet-stream"],
    });

    if (picked.canceled || !picked.result) {
      return null;
    }

    const file = picked.result;
    const rawText = await file.text();
    return validateDuitkuImportJson(rawText, file.name || "duitku-export.json");
  };

const chunkArray = <T>(items: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
};

/**
 * Replaces ALL data in the mobile SQLite database with the imported JSON data atomically.
 */
export const importDuitkuJsonToDatabase = async (
  payload: DuitkuExportPayload
): Promise<void> => {
  const {
    wallets: rawWallets,
    categories: rawCategories,
    transactions: rawTransactions,
    budgets: rawBudgets,
  } = payload.data;

  const walletIdSet = new Set<number>();
  const categoryIdSet = new Set<number>();

  const walletValues = rawWallets.map((w) => {
    walletIdSet.add(Number(w.id));
    return {
      id: Number(w.id),
      name: String(w.name).trim(),
      initialBalance: Math.round(Number(w.initialBalance ?? 0)),
      createdAt: parseCreatedAtDate(w.createdAt),
    };
  });

  const categoryValues = rawCategories.map((c) => {
    categoryIdSet.add(Number(c.id));
    return {
      id: Number(c.id),
      name: String(c.name).trim(),
      type: (c.type === "income" ? "income" : "expense") as
        | "income"
        | "expense",
      color:
        typeof c.color === "string" && c.color.trim()
          ? c.color.trim()
          : "#6366f1",
      createdAt: parseCreatedAtDate(c.createdAt),
    };
  });

  // Deduplicate budgets by (categoryId, month) and ensure categoryId exists
  const seenBudgetKey = new Set<string>();
  const budgetValues = rawBudgets
    .filter((b) => {
      const catId = Number(b?.categoryId);
      const monthStr = String(b?.month ?? "").trim();
      if (!categoryIdSet.has(catId) || !/^\d{4}-\d{2}$/.test(monthStr)) {
        return false;
      }
      const key = `${catId}:${monthStr}`;
      if (seenBudgetKey.has(key)) return false;
      seenBudgetKey.add(key);
      return true;
    })
    .map((b) => ({
      id: typeof b.id === "number" ? b.id : undefined,
      categoryId: Number(b.categoryId),
      month: String(b.month).trim(),
      limitAmount: Math.max(0, Math.round(Number(b.limitAmount ?? 0))),
      createdAt: parseCreatedAtDate(b.createdAt),
    }));

  // Filter valid transactions whose walletId and categoryId exist
  const transactionValues = rawTransactions
    .filter((t) => {
      const wId = Number(t?.walletId);
      const cId = Number(t?.categoryId);
      const amt = Number(t?.amount);
      return (
        walletIdSet.has(wId) &&
        categoryIdSet.has(cId) &&
        Number.isFinite(amt) &&
        amt >= 0 &&
        (t?.type === "income" || t?.type === "expense")
      );
    })
    .map((t) => ({
      id: typeof t.id === "number" ? t.id : undefined,
      walletId: Number(t.walletId),
      categoryId: Number(t.categoryId),
      amount: Math.round(Number(t.amount)),
      type: (t.type === "income" ? "income" : "expense") as
        | "income"
        | "expense",
      note:
        t.note !== undefined && t.note !== null ? String(t.note) : null,
      date: normalizeTxDate(t.date),
      createdAt: parseCreatedAtDate(t.createdAt),
    }));

  await db.transaction(async (tx) => {
    // 1. Delete all existing rows (children first to satisfy foreign keys)
    await tx.delete(transactions);
    await tx.delete(budgets);
    await tx.delete(wallets);
    await tx.delete(categories);

    // 2. Insert Wallets
    for (const chunk of chunkArray(walletValues, 50)) {
      await tx.insert(wallets).values(chunk);
    }

    // 3. Insert Categories
    for (const chunk of chunkArray(categoryValues, 50)) {
      await tx.insert(categories).values(chunk);
    }

    // 4. Insert Budgets
    for (const chunk of chunkArray(budgetValues, 50)) {
      await tx.insert(budgets).values(chunk);
    }

    // 5. Insert Transactions
    for (const chunk of chunkArray(transactionValues, 50)) {
      await tx.insert(transactions).values(chunk);
    }
  });
};

export function useImportDuitkuJson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DuitkuExportPayload) =>
      importDuitkuJsonToDatabase(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
