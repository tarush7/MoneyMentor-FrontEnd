import { useMutation, useQueryClient } from '@tanstack/react-query'
import { upsertTransactionLabel } from '../api/upsertTransactionLabel'
import { transactionKeys } from '../keys'

export function useUpsertTransactionLabelMutation(transactionId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: upsertTransactionLabel,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionKeys.all }),
        queryClient.invalidateQueries({
          queryKey: transactionKeys.detail(transactionId),
        }),
      ])
    },
  })
}
