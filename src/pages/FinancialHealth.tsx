import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Heart, Plus } from 'lucide-react'
import { api } from '../services/api'
import type { Page } from '../types'

interface FinancialHealthProps {
  onNav?: (p: Page) => void
}

function BigGauge({ score }: { score: number }) {
  const r = 110, cx = 140, cy = 140
  const c = 2 * Math.PI * r
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#FB7185'
  return (
    <div className="relative w-72 h-72 flex items-center justify-center mx-auto">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeDashoffset={0}
          transform={`rotate(135 ${cx} ${cy})`} className="dark:stroke-slate-800" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${c * (score / 100) * 0.75} ${c}`} strokeDashoffset={0}
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 12px ${color}80)`, transition: 'stroke-dasharray 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black" style={{ color }}>{score}</span>
        <span className="text-slate-400 text-sm mt-1">out of 100</span>
        <span className="mt-2 text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${color}15`, color }}>
          {score >= 80 ? '🌟 Excellent' : score >= 60 ? '👍 Good' : '⚠️ Needs Work'}
        </span>
      </div>
    </div>
  )
}

export default function FinancialHealth({ onNav }: FinancialHealthProps) {
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.analytics.getSummary()
      .then(res => {
        if (res.success && res.summary) setSummary(res.summary)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const score = summary?.healthScore
  const factors = summary?.healthFactors

  if (score === null || score === undefined) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-500 mb-2">
          <Heart size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Add transactions to start building your Financial Health Score</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Your Health Score is never hardcoded. It is calculated strictly from measurable financial behavior such as savings rate, budget discipline, overspending frequency, and spending consistency.
        </p>
        {onNav && (
          <button
            onClick={() => onNav('add-expense')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            + Add Your First Transaction
          </button>
        )}
      </div>
    )
  }

  const metricCards = [
    { label: 'Savings Discipline', value: factors?.savingsDiscipline || 'Moderate', desc: 'Evaluates monthly savings relative to income', color: '#10B981' },
    { label: 'Budget Adherence', value: factors?.budgetAdherence || 'Good', desc: 'Compares total expenses against monthly budget limit', color: '#3B82F6' },
    { label: 'Overspending Risk', value: factors?.overspendingRisk || 'Low', desc: 'Tracks frequency of large single-category expenses', color: '#6366F1' },
    { label: 'Spending Consistency', value: factors?.spendingConsistency || 'Balanced', desc: 'Analyzes category diversification and expense spikes', color: '#8B5CF6' },
  ]

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Health Score</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculated strictly from your actual financial data</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="relative flex flex-col items-center text-center">
          <p className="text-slate-400 text-sm font-medium mb-6 uppercase tracking-widest">MoneyMate · Live Financial Health</p>
          <BigGauge score={score} />
          <p className="text-slate-300 text-sm mt-4 max-w-sm">
            Calculated from your <span className="text-emerald-400 font-bold">{summary?.transactionCount || 0} transactions</span> and real monthly income.
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Contributing Factors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricCards.map(m => (
            <div key={m.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{m.label}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {m.value}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
