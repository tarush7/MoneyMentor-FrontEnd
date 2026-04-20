import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveTransactionLabelAndCreateRule } from '../api/saveTransactionLabelAndCreateRule'
import { transactionKeys } from '../keys'

export function useCreateTaggingRuleMutation(transactionId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: saveTransactionLabelAndCreateRule,
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
