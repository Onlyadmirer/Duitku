import { db } from "@/db/client";
import { createWalletType, updateWalletType } from "./type";
import { wallets } from "@/db/schema";
import { eq } from "drizzle-orm";

export const createWallet = async (data: createWalletType) => {
  const [wallet] = await db.insert(wallets).values(data).returning()

  return wallet
}

export const listWallets = async () => {
  return await db.select().from(wallets)
}

export const updateWallet = async (id: number, data: updateWalletType) => {
  await db.update(wallets).set(data).where(eq(wallets.id, id))
}

export const removeWallet = async (id: number) => {
  await db.delete(wallets).where(eq(wallets.id, id))
}