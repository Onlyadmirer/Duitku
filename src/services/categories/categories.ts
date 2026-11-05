import { db } from "@/db/client"
import { categories } from "@/db/schema"
import { categoryType, inputCategoryType } from "./type"
import { eq } from "drizzle-orm"

export const addCategory = async (data: inputCategoryType) => {
  return await db.insert(categories).values(data).returning()
}


export const listCategories = async (type: categoryType) => {
  return await db.select().from(categories).where(
    type ? eq(categories.type, type) : undefined
  )
}

export const getOneCategory = async (id: number) => {
  const [category] = await db.select().from(categories).where(eq(categories.id, id))

  return category
}

export const removeCategory = async (id: number) => {
  await db.delete(categories).where(eq(categories.id, id))
}