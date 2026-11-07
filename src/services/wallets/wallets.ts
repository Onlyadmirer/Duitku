import { db } from "@/db/client";
import {
  createWalletType,
  transferWalletType,
  updateWalletType,
} from "./type";
import { categories, transactions, wallets } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export const TRANSFER_OUT_CATEGORY_NAME = "Transfer Keluar";
export const TRANSFER_IN_CATEGORY_NAME = "Transfer Masuk";

export const createWallet = async (data: createWalletType) => {
  const [wallet] = await db.insert(wallets).values(data).returning();

  return wallet;
};

export const listWallets = async () => {
  return await db.select().from(wallets);
};

export const updateWallet = async (id: number, data: updateWalletType) => {
  await db.update(wallets).set(data).where(eq(wallets.id, id));
};

export const removeWallet = async (id: number) => {
  await db.delete(wallets).where(eq(wallets.id, id));
};

export const transferWalletFunds = async (data: transferWalletType) => {
  if (data.fromWalletId === data.toWalletId) {
    throw new Error("Dompet asal dan tujuan tidak boleh sama.");
  }
  if (data.amount <= 0) {
    throw new Error("Nominal transfer harus lebih dari 0.");
  }

  const adminFee = Math.max(0, data.adminFee ?? 0);
  const txDate = data.date ?? new Date().toISOString();
  const cleanNote = data.note?.trim() ?? "";

  await db.transaction(async (tx) => {
    const [fromWallet] = await tx
      .select()
      .from(wallets)
      .where(eq(wallets.id, data.fromWalletId));
    const [toWallet] = await tx
      .select()
      .from(wallets)
      .where(eq(wallets.id, data.toWalletId));

    if (!fromWallet || !toWallet) {
      throw new Error("Dompet tidak ditemukan.");
    }

    // Ensure Transfer Keluar category exists
    let [outCat] = await tx
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, TRANSFER_OUT_CATEGORY_NAME),
          eq(categories.type, "expense")
        )
      );

    if (!outCat) {
      [outCat] = await tx
        .insert(categories)
        .values({
          name: TRANSFER_OUT_CATEGORY_NAME,
          type: "expense",
          color: "#0EA5E9",
        })
        .returning();
    }

    // Ensure Transfer Masuk category exists
    let [inCat] = await tx
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, TRANSFER_IN_CATEGORY_NAME),
          eq(categories.type, "income")
        )
      );

    if (!inCat) {
      [inCat] = await tx
        .insert(categories)
        .values({
          name: TRANSFER_IN_CATEGORY_NAME,
          type: "income",
          color: "#10B981",
        })
        .returning();
    }

    const outNoteParts = [`Transfer ke ${toWallet.name}`];
    if (cleanNote) outNoteParts.push(cleanNote);
    if (adminFee > 0) outNoteParts.push(`Biaya admin Rp ${adminFee}`);

    const inNoteParts = [`Transfer dari ${fromWallet.name}`];
    if (cleanNote) inNoteParts.push(cleanNote);

    await tx.insert(transactions).values([
      {
        walletId: fromWallet.id,
        categoryId: outCat.id,
        amount: data.amount + adminFee,
        type: "expense",
        note: outNoteParts.join(" • "),
        date: txDate,
      },
      {
        walletId: toWallet.id,
        categoryId: inCat.id,
        amount: data.amount,
        type: "income",
        note: inNoteParts.join(" • "),
        date: txDate,
      },
    ]);
  });
};