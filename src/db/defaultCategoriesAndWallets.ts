export type DefaultCategory = {
  name: string;
  type: "income" | "expense";
  color: string;
};

export const DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  { name: "Gaji", type: "income", color: "#006C49" },
  { name: "Bonus", type: "income", color: "#0284C7" },
  { name: "Investasi", type: "income", color: "#7C3AED" },
  { name: "Makan & Minum", type: "expense", color: "#EA580C" },
  { name: "Transportasi", type: "expense", color: "#B45309" },
  { name: "Belanja", type: "expense", color: "#DB2777" },
  { name: "Tagihan", type: "expense", color: "#0284C7" },
  { name: "Kesehatan", type: "expense", color: "#DC2626" },
  { name: "Pendidikan", type: "expense", color: "#7C3AED" },
  { name: "Hiburan", type: "expense", color: "#F59E0B" },
  { name: "Olahraga", type: "expense", color: "#059669" },
  { name: "Lainnya", type: "expense", color: "#64748B" },
] as const;

export const DEFAULT_WALLETS = [
  { name: "Dompet Utama" }
]