import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, History, Plus } from 'lucide-react'
import { api } from '../services/api'
import type { Page } from '../types'

interface TimeMachineProps {
  onNav?: (p: Page) => void
}

export default function TimeMachine({ onNav }: TimeMachineProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.analytics.getTimeMachine()
      .then(res => {
        if (res.success) setData(res)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Analyzing financial history...
      </div>
    )
  }

  if (!data?.hasEnoughData) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 mb-2">
          <History size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Time Machine needs more financial history</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          {data?.message || "Keep tracking your spending and we'll start identifying your patterns, spending velocity, and future wealth trajectory."}
        </p>
        {onNav && (
          <button
            onClick={() => onNav('add-expense')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            + Record More Transactions
          </button>
        )}
      </div>
    )
  }

  const insights = data.insights

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Time Machine</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Real Historical Behavioral Analysis
        </p>
      </div>

      {/* Historical Facts Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg mb-1">Calculated Historical Fact</h3>
            <p className="text-sm text-indigo-100 leading-relaxed">
              {insights?.historicalFact}
            </p>
          </div>
        </div>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Total Tracked Expenses</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{insights?.totalTrackedExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-2">Sum of recorded expense transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Top Category Concentration</p>
          <p className="text-2xl font-bold text-emerald-600">
            {insights?.topSpendingCategory}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            ₹{insights?.topCategorySpent.toLocaleString('en-IN')} spent
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <p className="text-xs text-slate-400 mb-1">Average Per Transaction</p>
          <p className="text-2xl font-bold text-indigo-600">
            ₹{insights?.averageExpensePerTransaction.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-2">Historical transaction average</p>
        </div>
      </div>
    </div>
  )
}
