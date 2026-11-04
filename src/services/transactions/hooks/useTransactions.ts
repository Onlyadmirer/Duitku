import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { addTransaction, fetchTransactions } from "../transactions"
import { addTransactionType } from "../type"


export const QUERY_KEY_TRANSACTION = ['transactions']

export function useTransactions() {
  const queryClient = useQueryClient()

  const transactionsQuery = useQuery({
    queryKey: QUERY_KEY_TRANSACTION,
    queryFn: fetchTransactions
  })

  const addMutation = useMutation({
    mutationFn: (newTx: addTransactionType) => addTransaction(newTx),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_TRANSACTION })
    }
  })


  return {
    transactions: transactionsQuery.data ?? [],
    isLoading: transactionsQuery.isLoading,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    addTransaction: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    refetch: transactionsQuery.refetch,
  };
}