import { useInfiniteQuery } from '@tanstack/react-query'
import { getTransactions } from '../api/getTransactions'
import { transactionKeys } from '../keys'

export function useInfiniteTransactionsQuery({ pageSize, enabled = true }) {
  return useInfiniteQuery({
    queryKey: transactionKeys.infiniteList({ pageSize }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getTransactions({
        page: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const loadedCount = lastPage.page * lastPage.pageSize
      return loadedCount < lastPage.totalCount ? lastPage.page + 1 : undefined
    },
    staleTime: 30 * 1000,
    enabled,
  })
}
