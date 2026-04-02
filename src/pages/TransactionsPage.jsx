import { useDispatch, useSelector } from 'react-redux'
import { setPage, setPageSize } from '../store/slices/filtersSlice'
import { openTransactionModal } from '../store/slices/uiSlice'
import { useTransactionsQuery } from '../features/transactions/hooks/useTransactionsQuery'
import TransactionsTable from '../features/transactions/components/TransactionsTable'
import TransactionsPagination from '../features/transactions/components/TransactionsPagination'
import AppShell from '../components/layout/AppShell'

export default function TransactionsPage() {
  const dispatch = useDispatch()
  const { page, pageSize } = useSelector((state) => state.filters)

  const { data, isLoading, isError, error, isFetching } =
    useTransactionsQuery({ page, pageSize })

  const rows = data?.rows ?? []
  const totalCount = data?.totalCount ?? 0

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-28 md:px-6 lg:pt-32">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Transactions</h1>
            <p className="text-sm text-white/65">
              Review transactions and train your tagging layer.
            </p>
          </div>

          {isFetching && !isLoading ? (
            <span className="loading loading-spinner loading-sm text-cyan-200" />
          ) : null}
        </div>

        <TransactionsTable
          rows={rows}
          isLoading={isLoading}
          isError={isError}
          error={error}
          pageSize={pageSize}
          onReview={(transactionId) =>
            dispatch(openTransactionModal(transactionId))
          }
        />

        <TransactionsPagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPrev={() => dispatch(setPage(page - 1))}
          onNext={() => dispatch(setPage(page + 1))}
          onPageSizeChange={(size) => dispatch(setPageSize(size))}
        />
      </div>
    </AppShell>
  )
}
