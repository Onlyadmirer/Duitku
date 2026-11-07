import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryType, inputCategoryType, updateCategoryType } from "../type";
import {
  addCategory,
  getOneCategory,
  listCategories,
  removeCategory,
  updateCategory,
} from "../categories";
import { reportKeys } from "@/services/reports/hooks/useReports";
import { transactionKeys } from "@/services/transactions/hooks/useTransactions";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (params?: categoryType) =>
    [...categoryKeys.lists(), params ?? "all"] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

export function useCategories(params?: categoryType) {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => listCategories(params),
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => getOneCategory(id),
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: inputCategoryType) => addCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: updateCategoryType }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    },
  });
}

export function useRemoveCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
