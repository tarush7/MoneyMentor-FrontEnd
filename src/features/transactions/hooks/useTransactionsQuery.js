import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '../api/getTransactions'
import { transactionKeys } from '../keys'

export function useTransactionsQuery({ page, pageSize }) {
  return useQuery({
    queryKey: transactionKeys.list({ page, pageSize }),
    queryFn: () => getTransactions({ page, pageSize }),
    staleTime: 30 * 1000,
  })
}