import { useQuery } from "@tanstack/react-query";
import {
  byCategory,
  monthlyTrends,
  summary,
  walletBalances,
} from "../reports";

export const reportKeys = {
  all: ["reports"] as const,
  summary: (month: string) => [...reportKeys.all, "summary", month] as const,
  byCategory: (month: string) =>
    [...reportKeys.all, "byCategory", month] as const,
  monthlyTrends: (year: number) =>
    [...reportKeys.all, "monthlyTrends", year] as const,
  walletBalances: () => [...reportKeys.all, "walletBalances"] as const,
};

export function useReportSummary(month: string) {
  return useQuery({
    queryKey: reportKeys.summary(month),
    queryFn: () => summary(month),
  });
}

export function useReportByCategory(month: string) {
  return useQuery({
    queryKey: reportKeys.byCategory(month),
    queryFn: () => byCategory(month),
  });
}

export function useMonthlyTrends(year: number) {
  return useQuery({
    queryKey: reportKeys.monthlyTrends(year),
    queryFn: () => monthlyTrends(year),
  });
}

export function useWalletBalances() {
  return useQuery({
    queryKey: reportKeys.walletBalances(),
    queryFn: walletBalances,
  });
}
