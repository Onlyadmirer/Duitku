import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { db } from "./client";
import migrations from "../../drizzle/migrations";
import { useEffect, useState } from "react";
import { seedDatabase } from "./seed";
import { logAllTables } from "./debug";

export function useDatabaseReady() {
  const { success, error } = useMigrations(db, migrations)
  const [isSeeded, setIsSeeding] = useState(false)

  useEffect(() => {
    async function runSeed() {
      if (success) {
        await seedDatabase(db)
        setIsSeeding(true)
      }
    }
    runSeed()
  }, [success])

  useEffect(() => {
    if (success && isSeeded) {
      logAllTables();
    }
  }, [success, isSeeded]);


  return {
    success, error, isSeeded
  }

}