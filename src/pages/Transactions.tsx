import { useState, useEffect } from 'react'
import { Search, Filter, Download, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react'
import { api } from '../services/api'
import { dataStore } from '../services/dataStore'
import type { Page } from '../types'

const categoryOptions = ['All', 'Food & Dining', 'Housing', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Groceries', 'Utilities', 'Salary', 'Freelance', 'Other']

interface TransactionsProps {
  onNav?: (p: Page) => void
}

export default function Transactions({ onNav }: TransactionsProps) {
  const [txList, setTxList] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<'date' | 'amount'>('date')
  const [loading, setLoading] = useState(true)

  const fetchTransactions = () => {
    setLoading(true)
    const local = dataStore.getTransactions()
    setTxList(local)
    setLoading(false)

    dataStore.syncWithBackend().then(() => {
      setTxList(dataStore.getTransactions())
    }).catch(console.warn)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this transaction?')) {
      dataStore.deleteTransaction(id)
      fetchTransactions()

      api.transactions.delete(id).catch(console.warn)
    }
  }

  const filtered = txList
    .filter(tx => {
      const matchSearch =
        tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase()) ||
        (tx.description && tx.description.toLowerCase().includes(search.toLowerCase()))
      const matchCat = category === 'All' || tx.category === category
      return matchSearch && matchCat
    })
    .sort((a, b) => {
      if (sort === 'amount') return b.amount - a.amount
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const totalIncome = txList.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0)
  const totalExpense = txList.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time persistent transaction history</p>
        </div>
        <div className="flex items-center gap-3">
          {onNav && (
            <button
              onClick={() => onNav('add-expense')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <Plus size={14} />
              + Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <ArrowUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Income Recorded</p>
            <p className="text-lg font-bold text-emerald-600">+₹{totalIncome.toLocaleString('en-IN')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
            <ArrowDown size={16} className="text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Expenses Recorded</p>
            <p className="text-lg font-bold text-rose-500">-₹{totalExpense.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions by merchant, category, or note..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value as 'date' | 'amount')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categoryOptions.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              category === cat
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Icon</span>
          <span>Merchant & Category</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Action</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl mb-3">
              💸
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No transactions yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Your transactions will appear here once you add them manually or scan a receipt.
            </p>
            {onNav && (
              <button
                onClick={() => onNav('add-expense')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm"
              >
                <Plus size={14} />
                + Add Transaction
              </button>
            )}
          </div>
        ) : (
          filtered.map(tx => (
            <div
              key={tx.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                {tx.emoji || '💸'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.merchant}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {tx.category} {tx.description ? `· ${tx.description}` : ''}
                </p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{tx.date}</span>
              <span
                className={`text-sm font-bold text-right ${
                  tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
              <button
                onClick={(e) => handleDelete(tx.id, e)}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors ml-auto"
                title="Delete transaction"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
