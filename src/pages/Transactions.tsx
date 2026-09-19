import { useState } from 'react'
import { Search, Filter, Download, ArrowUp, ArrowDown } from 'lucide-react'
import { transactions } from '../data/mockData'

const allTransactions = [
  ...transactions,
  { id: 9, merchant: 'D-Mart', category: 'Groceries', amount: -3200, date: 'Jul 11', emoji: '🛒' },
  { id: 10, merchant: 'Spotify', category: 'Entertainment', amount: -179, date: 'Jul 10', emoji: '🎵' },
  { id: 11, merchant: 'Freelance Project', category: 'Income', amount: 15000, date: 'Jul 8', emoji: '💻' },
  { id: 12, merchant: 'Max Fashion', category: 'Shopping', amount: -1899, date: 'Jul 7', emoji: '👕' },
  { id: 13, merchant: 'HDFC ATM', category: 'Cash', amount: -5000, date: 'Jul 5', emoji: '🏧' },
  { id: 14, merchant: 'BookMyShow', category: 'Entertainment', amount: -840, date: 'Jul 3', emoji: '🎬' },
]

const categories = ['All', 'Income', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Groceries', 'Cash']

export default function Transactions() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState<'date' | 'amount'>('date')

  const filtered = allTransactions
    .filter(tx => {
      const matchSearch = tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      const matchCat = category === 'All' || tx.category === category
      return matchSearch && matchCat
    })
    .sort((a, b) => sort === 'amount' ? Math.abs(b.amount) - Math.abs(a.amount) : b.id - a.id)

  const totalIncome = allTransactions.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0)
  const totalExpense = allTransactions.filter(t => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0)

  return (
    <div className="max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">July 2025</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-sm px-3 py-2 rounded-xl transition-colors">
          <Download size={14} />
          Export
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <ArrowUp size={16} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Income</p>
            <p className="text-lg font-bold text-emerald-600">+₹{totalIncome.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
            <ArrowDown size={16} className="text-rose-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Expenses</p>
            <p className="text-lg font-bold text-rose-500">-₹{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Search & filter bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 px-3 py-2.5 rounded-xl text-sm transition-colors">
          <Filter size={14} />
          Filter
        </button>
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
        {categories.map(cat => (
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
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Icon</span>
          <span>Transaction</span>
          <span>Date</span>
          <span className="text-right">Amount</span>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No transactions found</div>
        ) : (
          filtered.map((tx, i) => (
            <div
              key={tx.id}
              className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                {tx.emoji}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tx.merchant}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tx.category}</p>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap">{tx.date}</span>
              <span
                className={`text-sm font-bold text-right ${
                  tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                }`}
              >
                {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
