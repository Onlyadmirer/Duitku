import { eq } from "drizzle-orm";

import { DEFAULT_CATEGORIES, DEFAULT_WALLETS } from "./defaultCategoriesAndWallets";
import { appMeta, categories, wallets } from "./schema";
import type { AppDatabase } from "./types";

export const DEFAULT_CATEGORIES_SEED_KEY = "default_categories_seeded_v1";

export type SeedResult = {
  seeded: boolean;
};

/**
 * Seed 12 kategori default sekali saja.
 *
 * Flag disimpan di `app_meta`, sehingga membuka aplikasi berkali-kali tidak
 * menggandakan kategori dan kategori yang dihapus pengguna tidak otomatis
 * muncul kembali. Seluruh insert + flag berada dalam satu transaksi.
 */
export async function seedDatabase(
  database: AppDatabase,
): Promise<SeedResult> {
  const existing = await database
    .select({ key: appMeta.key })
    .from(appMeta)
    .where(eq(appMeta.key, DEFAULT_CATEGORIES_SEED_KEY))
    .limit(1);

  if (existing.length > 0) {
    return { seeded: false };
  }

  await database.transaction(async (tx) => {
    const inside = await tx
      .select({ key: appMeta.key })
      .from(appMeta)
      .where(eq(appMeta.key, DEFAULT_CATEGORIES_SEED_KEY))
      .limit(1);

    if (inside.length > 0) return;

    await tx.insert(categories).values(
      DEFAULT_CATEGORIES.map((category) => ({
        name: category.name,
        type: category.type,
        color: category.color,
      })),
    );

    await tx.insert(wallets).values(
      DEFAULT_WALLETS.map((category) => ({
        name: category.name,
      })),
    );

    await tx.insert(appMeta).values({
      key: DEFAULT_CATEGORIES_SEED_KEY,
      value: new Date().toISOString(),
    });
  });

  return { seeded: true };
}
