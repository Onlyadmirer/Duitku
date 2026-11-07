import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWallet,
  listWallets,
  removeWallet,
  updateWallet,
} from "../wallets";
import { createWalletType, updateWalletType } from "../type";
import { reportKeys } from "@/services/reports/hooks/useReports";

export const walletKeys = {
  all: ["wallets"] as const,
  lists: () => [...walletKeys.all, "list"] as const,
  list: () => [...walletKeys.lists()] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: number) => [...walletKeys.details(), id] as const,
};

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: listWallets,
  });
}

export function useAddWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: createWalletType) => createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: updateWalletType }) =>
      updateWallet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useRemovewallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
