import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addTransaction, fetchTransactions, getOneTransaction, removeTransaction, transactionUpdate } from "../transactions"
import { addTransactionType, listTransactionType, updateTransactionType } from "../type"


export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (params: listTransactionType) =>
    [...transactionKeys.lists(), params] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: number) =>
    [...transactionKeys.details(), id] as const,
};



export function useTransactions(params: listTransactionType) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => fetchTransactions(params),
  });
}

export function useTransaction(id: number) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getOneTransaction(id)
  })
}

export function useAddTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: addTransactionType) => addTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all
      })
    }
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: updateTransactionType }) => transactionUpdate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all
      })
    }
  })
}

export function useRemoveTransaction() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => removeTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.all
      })
    }
  })
}