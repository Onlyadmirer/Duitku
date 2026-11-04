import { db } from './client';
import { categories, wallets, transactions, budgets } from './schema';

export const logAllTables = async () => {
  console.log('================ DATABASE DUMP ================');
  console.log('📁 CATEGORIES:', await db.select().from(categories));
  console.log('💳 WALLETS:', await db.select().from(wallets));
  console.log('💸 TRANSACTIONS:', await db.select().from(transactions));
  console.log('💸 BUDGETS:', await db.select().from(budgets));
  console.log('===============================================');
};