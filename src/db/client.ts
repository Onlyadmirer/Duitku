// src/db/client.ts
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import * as relations from "./relation";

const expoDb = SQLite.openDatabaseSync('duitku.db');

expoDb.execSync("PRAGMA foreign_keys = ON;");

export const db = drizzle(expoDb, { schema: { ...schema, ...relations } });