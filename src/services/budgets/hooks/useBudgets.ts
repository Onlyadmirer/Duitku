import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addBudgets, listBudgets, removeBudget } from "../budgets";
import { addBudgetsType } from "../types";
import { reportKeys } from "@/services/reports/hooks/useReports";

export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: (month: string) => [...budgetKeys.lists(), month] as const,
};

export function useBudgets(month: string) {
  return useQuery({
    queryKey: budgetKeys.list(month),
    queryFn: () => listBudgets(month),
  });
}

export function useUpsertBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: addBudgetsType) => addBudgets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useRemoveBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
