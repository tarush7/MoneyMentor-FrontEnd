import { useDispatch, useSelector } from 'react-redux'
import { setPage, setPageSize } from '../store/slices/filtersSlice'
import { openTransactionModal } from '../store/slices/uiSlice'
import { useTransactionsQuery } from '../features/transactions/hooks/useTransactionsQuery'
import TransactionsTable from '../features/transactions/components/TransactionsTable'
import TransactionsPagination from '../features/transactions/components/TransactionsPagination'
import TransactionManageModal from '../features/transactions/components/manage-modal/TransactionManageModal'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../providers/AuthProvider'

export default function TransactionsPage() {
  const dispatch = useDispatch()
  const { page, pageSize } = useSelector((state) => state.filters)
  const { isAuthReady, isAuthenticated } = useAuth()

  const { data, isLoading, isError, error, isFetching } =
    useTransactionsQuery({ page, pageSize, enabled: isAuthReady && isAuthenticated })

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

          {isAuthenticated && isFetching && !isLoading ? (
            <span className="loading loading-spinner loading-sm text-cyan-200" />
          ) : null}
        </div>

        {!isAuthReady ? (
          <div className="rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] px-6 py-16 text-center shadow-[0_28px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <span className="loading loading-spinner loading-md text-cyan-200" />
            <p className="mt-4 text-sm text-white/[0.62]">Checking your session...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="rounded-[2rem] border border-white/[0.12] bg-[linear-gradient(180deg,rgba(13,16,34,0.72)_0%,rgba(6,8,18,0.74)_100%)] px-6 py-14 shadow-[0_28px_70px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
            <div className="mx-auto max-w-xl text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.42]">
                Authentication Required
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-white">
                Sign in to access your full transaction feed.
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/[0.62]">
                Use the account icon in the glass navbar to sign in with your Supabase user.
                Once authenticated, this page will load the protected transaction dataset.
              </p>
            </div>
          </div>
        ) : (
          <>
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

            <TransactionManageModal />
          </>
        )}
      </div>
    </AppShell>
  )
}
