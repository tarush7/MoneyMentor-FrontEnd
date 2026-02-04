import { useEffect, useState } from 'react'
import { supabase } from './supabase'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  
  // Auth State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ROWS_PER_PAGE = 10 

  // Modal State
  const [selectedTxn, setSelectedTxn] = useState(null)

  // 1. Check for existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setPage(1) 
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. Fetch data
  useEffect(() => {
    fetchTransactions()
  }, [session, page])

  function getTxnTimestamp(txn) {
    const primary = txn.message_datetime_utc || txn.parsed_txn_datetime || txn.parsed_txn_date
    if (primary) {
      const ts = Date.parse(primary)
      if (!Number.isNaN(ts)) return ts
    }
    const created = Date.parse(txn.created_at)
    if (!Number.isNaN(created)) return created
    return 0
  }

  async function fetchTransactions() {
    setLoading(true)
    let data, error, count

    try {
      if (session) {
        const from = (page - 1) * ROWS_PER_PAGE
        const to = from + ROWS_PER_PAGE - 1

        const response = await supabase
          .from('transactions_enriched')
          .select('*', { count: 'exact' })
          .order('message_datetime_utc', { ascending: false })
          .range(from, to)
        
        data = response.data
        error = response.error
        count = response.count
        
        if (count) setTotalPages(Math.ceil(count / ROWS_PER_PAGE))

      } else {
        const response = await supabase.rpc('get_public_preview')
        data = response.data
        error = response.error
        setTotalPages(1)
      }

      if (error) throw error
      const sorted = (data || [])
        .slice()
        .sort((a, b) => getTxnTimestamp(b) - getTxnTimestamp(a))
      setTransactions(sorted)
    } catch (error) {
      console.error('Error fetching data:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Auth Handlers
  async function handleLogin(e) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  // Helper to open modal
  function openModal(txn) {
    setSelectedTxn(txn)
    document.getElementById('txn_modal').showModal()
  }

  return (
    // iOS THEME: Deep Blue-Black Background with "Spotlight" Gradient
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-slate-200 p-4 md:p-8 font-sans antialiased">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          {/* Typography: Clean, Tracking-tight for modern look */}
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-sm">MoneyMentor</h1>
          <div className={`badge mt-2 border-0 ${session ? 'bg-indigo-500/20 text-indigo-200' : 'bg-slate-700/50 text-slate-400'}`}>
            {session ? 'Admin Mode [Full Access]' : 'Public Preview [Last 10 Txns]'}
          </div>
        </div>

        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden md:block">{session.user.email}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm">Logout</button>
            </div>
          ) : (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-md btn-outline border-white/20 text-white hover:bg-white/10 hover:border-white/40">Admin Login</div>
              <div tabIndex={0} className="dropdown-content z-[1] card card-compact w-64 p-2 shadow-2xl bg-slate-900 border border-slate-700 mt-2">
                <div className="card-body">
                  <form onSubmit={handleLogin} className="flex flex-col gap-2">
                    <input type="email" placeholder="Email" className="input input-bordered input-sm w-full bg-slate-800 text-white border-slate-700 p-2"
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="input input-bordered input-sm w-full bg-slate-800 text-white border-slate-700 p-2"
                      value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="btn btn-sm w-full btn-outline border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-400">Sign In</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GLASS CARD: The Main Table Container */}
      <div className="max-w-6xl mx-auto rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-0">
          {loading ? (
            <div className="flex justify-center p-12">
              <span className="loading loading-spinner loading-lg text-indigo-400"></span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-lg">
                  {/* Table Header: Semi-transparent slate */}
                  <thead className="bg-slate-900/50 text-slate-400 text-sm font-medium border-b border-white/5">
                    <tr>
                      <th className="pl-6">Date</th>
                      <th>Payee Info</th>
                      <th>Amount</th>
                      <th>Category</th>
                      <th className="pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {transactions.map((txn) => (
                      <tr key={txn.id || txn.message_id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="pl-6 whitespace-nowrap">
                          <div className="font-semibold text-slate-200">{txn.parsed_txn_date}</div>
                          <div className="text-xs text-slate-500 uppercase tracking-wider">{txn.parsed_txn_date_source}</div>
                        </td>
                        <td>
                          {/* Visual Hierarchy: Bold Name, Dimmed details */}
                          <div className="font-medium text-white text-base">{txn.upi_payee_name || "Unknown"}</div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{txn.body_text?.substring(0, 40)}...</div>
                        </td>
                        <td className={`font-mono font-medium text-lg ${txn.parsed_direction === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {txn.parsed_direction === 'DEBIT' ? '-' : '+'} ₹{txn.parsed_amount}
                        </td>
                        <td>
                          <span className="badge badge-outline border-slate-600 text-slate-400 badge-sm">{txn.narration_category}</span>
                        </td>
                        <td className="pr-6 text-right">
                          <button 
                            className="btn btn-ghost btn-xs text-indigo-300 hover:text-indigo-100 hover:bg-indigo-500/20 p-4"
                            onClick={() => openModal(txn)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination (Admin Only) */}
              {session && (
                <div className="flex justify-center p-6 border-t border-white/5 bg-black/20">
                  <div className="join bg-slate-900/50 border border-white/10 rounded-lg">
                    <button className="join-item btn btn-sm btn-ghost text-slate-300 hover:bg-white/10 p-4" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>«</button>
                    <button className="join-item btn btn-sm btn-ghost text-slate-300 cursor-default hover:bg-transparent p-4">Page {page} of {totalPages}</button>
                    <button className="join-item btn btn-sm btn-ghost text-slate-300 hover:bg-white/10 p-4" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>»</button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Public Preview Footer */}
          {!session && (
            <div className="p-6 bg-indigo-900/20 text-indigo-200 text-center text-sm font-medium border-t border-white/5 backdrop-blur-sm">
              🔒 You are viewing a limited public preview. Login to manage full history.
            </div>
          )}
        </div>
      </div>

      {/* --- INSPECTOR MODAL (Dark Theme) --- */}
      <dialog id="txn_modal" className="modal modal-bottom sm:modal-middle backdrop-blur-sm">
        <div className="modal-box w-11/12 max-w-4xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-200">
          {selectedTxn && (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="font-bold text-2xl text-white">{selectedTxn.upi_payee_name || "Unknown Payee"}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">ID: {selectedTxn.message_id}</p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-mono font-bold ${selectedTxn.parsed_direction === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {selectedTxn.parsed_direction === 'DEBIT' ? '-' : '+'} ₹{selectedTxn.parsed_amount}
                  </div>
                  <div className="badge bg-slate-800 text-slate-400 border-0 mt-2 p-3">{selectedTxn.parsed_txn_date}</div>
                </div>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Section 1: Extraction Source */}
                <div className="card bg-slate-800/50 border border-slate-700/50">
                  <div className="card-body p-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Payment Logic</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">Account Type</span>
                        <span className="font-mono text-white">{selectedTxn.account_type || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">Account Last4</span>
                        <span className="font-mono text-white">{selectedTxn.account_last4 || "N/A"}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">UPI VPA</span>
                        <span className="font-mono text-xs text-white">{selectedTxn.upi_vpa || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ref No</span>
                        <span className="font-mono text-xs text-white">{selectedTxn.upi_reference || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: AI Classification */}
                <div className="card bg-slate-800/50 border border-slate-700/50">
                  <div className="card-body p-5">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Classification</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">Category</span>
                        <span className="badge bg-indigo-500/20 text-indigo-300 border-0">{selectedTxn.narration_category}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <span className="text-slate-400">Sub-Type</span>
                        <span className="badge bg-slate-700 text-slate-300 border-0">{selectedTxn.narration_subtype || "General"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Confidence</span>
                        {selectedTxn.needs_llm_help ? (
                           <span className="text-amber-400 text-xs font-bold">Low (LLM Used)</span>
                        ) : (
                           <span className="text-emerald-400 text-xs font-bold">High (Regex)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: The Evidence */}
              <div className="mt-8">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Raw Email Source</h4>
                <div className="mockup-code bg-black text-slate-300 text-xs border border-slate-800">
                  <pre className="whitespace-pre-wrap p-5 pt-0"><code className="font-mono">{selectedTxn.body_text}</code></pre>
                </div>
              </div>
            </>
          )}
          <div className="modal-action">
            <form method="dialog">
              <button className="btn bg-slate-800 text-white border-slate-700 hover:bg-slate-700 p-4">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default App
