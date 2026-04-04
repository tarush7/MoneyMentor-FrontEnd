import { useQuery } from '@tanstack/react-query'
import { getTransactionDetails } from '../api/getTransactionDetails'
import { transactionKeys } from '../keys'

export function useTransactionDetailsQuery({
  transactionId,
  enabled = true,
}) {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => getTransactionDetails(transactionId),
    staleTime: 30 * 1000,
    enabled: enabled && Boolean(transactionId),
  })
}
