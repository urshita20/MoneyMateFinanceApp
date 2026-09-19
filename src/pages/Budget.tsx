import { useState } from 'react'
import { AlertTriangle, Sparkles, TrendingDown, CheckCircle, Edit2 } from 'lucide-react'
import { budgetCategories } from '../data/mockData'

export default function Budget() {
  const [budgets, setBudgets] = useState(budgetCategories)
  const [editing, setEditing] = useState<string | null>(null)

  const getStatus = (spent: number, budget: number) => {
    const pct = (spent / budget) * 100
    if (pct >= 100) return 'over'
    if (pct >= 80) return 'warning'
    return 'good'
  }

  const totalBudget = budgets.reduce((a, b) => a + b.budget, 0)
  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budget Planner</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">July 2025</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalSpent.toLocaleString()}</p>
          <p className="text-sm text-slate-500">of ₹{totalBudget.toLocaleString()} budget used</p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">Total Budget Used</span>
          <span className="font-bold text-slate-900 dark:text-white">{Math.round((totalSpent / totalBudget) * 100)}%</span>
        </div>
        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
            style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>₹{totalSpent.toLocaleString()} spent</span>
          <span>₹{(totalBudget - totalSpent).toLocaleString()} remaining</span>
        </div>
      </div>

      {/* AI Suggestion */}
      <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800/40 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-1">AI Budget Recommendation</p>
            <p className="text-sm text-violet-700 dark:text-violet-300">
              You've exceeded your Entertainment budget by ₹200. Consider reducing dining out by ₹2,000 next month — that
              alone would save you ₹24,000 annually.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="text-xs font-medium bg-violet-600 text-white px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors">
                Apply suggestion
              </button>
              <button className="text-xs font-medium text-violet-600 dark:text-violet-400 px-3 py-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 gap-4">
        {budgets.map(cat => {
          const pct = Math.min((cat.spent / cat.budget) * 100, 100)
          const status = getStatus(cat.spent, cat.budget)
          const remaining = cat.budget - cat.spent

          return (
            <div
              key={cat.category}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cat.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.category}</p>
                    <p className="text-xs text-slate-400">
                      {status === 'over'
                        ? `₹${Math.abs(remaining).toLocaleString()} over budget`
                        : `₹${remaining.toLocaleString()} left`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status === 'over' && <AlertTriangle size={14} className="text-rose-500" />}
                  {status === 'warning' && <AlertTriangle size={14} className="text-amber-500" />}
                  {status === 'good' && <CheckCircle size={14} className="text-emerald-500" />}
                  <button
                    onClick={() => setEditing(editing === cat.category ? null : cat.category)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    status === 'over'
                      ? 'bg-rose-500'
                      : status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Stats */}
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Spent: <strong className="text-slate-900 dark:text-white">₹{cat.spent.toLocaleString()}</strong>
                </span>
                <span className="text-slate-500">
                  Budget: <strong className="text-slate-900 dark:text-white">₹{cat.budget.toLocaleString()}</strong>
                </span>
              </div>

              {/* Edit budget input */}
              {editing === cat.category && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <input
                    type="number"
                    defaultValue={cat.budget}
                    className="flex-1 px-3 py-1.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                    onChange={e => {
                      const val = parseInt(e.target.value)
                      if (!isNaN(val)) {
                        setBudgets(bs => bs.map(b => b.category === cat.category ? { ...b, budget: val } : b))
                      }
                    }}
                  />
                  <button
                    onClick={() => setEditing(null)}
                    className="px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg hover:bg-emerald-600"
                  >
                    Save
                  </button>
                </div>
              )}

              {/* Warning badge */}
              {status !== 'good' && (
                <div
                  className={`mt-3 text-xs px-2.5 py-1.5 rounded-lg font-medium ${
                    status === 'over'
                      ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                      : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {status === 'over'
                    ? `⚠️ Over budget by ₹${Math.abs(remaining).toLocaleString()}`
                    : `⚡ ${Math.round(pct)}% used — slow down to stay on track`}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add category */}
      <button className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-medium text-slate-400 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all">
        + Add Budget Category
      </button>
    </div>
  )
}
