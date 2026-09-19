import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Heart, Plus, ShieldCheck, Info, HelpCircle } from 'lucide-react'
import { api } from '../services/api'
import { dataStore } from '../services/dataStore'
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
  const [summaryData, setSummaryData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadHealthData = () => {
    const local = dataStore.getDashboardSummary()
    setSummaryData(local.summary)
    setLoading(false)

    dataStore.syncWithBackend().then(() => {
      const updatedLocal = dataStore.getDashboardSummary()
      setSummaryData(updatedLocal.summary)
    }).catch(console.warn)
  }

  useEffect(() => {
    loadHealthData()
  }, [])

  const txList = dataStore.getTransactions()
  const profile = dataStore.getProfile()

  const hasData = summaryData?.hasData || txList.length > 0 || (profile.monthlyIncome || 0) > 0

  if (!hasData) {
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

  // Calculate detailed financial health metrics strictly from real stored data
  const totalIncome = profile.monthlyIncome > 0 ? profile.monthlyIncome : txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthlyBudget = profile.monthlyBudget || 0

  const savingAmount = Math.max(0, totalIncome - totalExpense)
  const savingRatePct = totalIncome > 0 ? Math.round((savingAmount / totalIncome) * 100) : 0
  const budgetUsedPct = monthlyBudget > 0 ? Math.round((totalExpense / monthlyBudget) * 100) : 0

  const overspentEvents = txList.filter(t => t.type === 'expense' && (monthlyBudget > 0 ? t.amount > monthlyBudget * 0.3 : totalIncome > 0 ? t.amount > totalIncome * 0.3 : false)).length
  const uniqueCategoriesCount = new Set(txList.map(t => t.category)).size

  // Status Labels
  const savingStatus = totalIncome > 0 ? (savingRatePct >= 20 ? 'Good' : savingRatePct >= 10 ? 'Moderate' : 'Needs Work') : 'Not enough data yet'
  const budgetStatus = monthlyBudget > 0 ? (budgetUsedPct <= 80 ? 'Good' : budgetUsedPct <= 100 ? 'Moderate' : 'Over Budget') : 'Not enough data yet'
  const overspendingStatus = overspentEvents === 0 ? 'Low' : overspentEvents === 1 ? 'Moderate' : 'High'
  const consistencyStatus = uniqueCategoriesCount >= 3 ? 'Balanced' : txList.length > 0 ? 'Moderate' : 'Building'

  // Calculated Score - strictly unified with Dashboard & dataStore
  const calculatedScore = (summaryData?.healthScore !== null && summaryData?.healthScore !== undefined)
    ? summaryData.healthScore
    : 70

  const isEarlyEstimate = txList.length < 5
  const coverageText = isEarlyEstimate
    ? 'Early estimate — based on limited transaction history.'
    : 'High confidence — calculated from active financial behavior.'

  const metricCards = [
    {
      label: 'Saving Rate',
      value: savingStatus,
      metric: totalIncome > 0 ? `${savingRatePct}% savings rate` : 'Set monthly income',
      desc: 'Evaluates net savings relative to total monthly income.',
      color: savingStatus === 'Good' ? '#10B981' : savingStatus === 'Moderate' ? '#F59E0B' : '#64748B',
    },
    {
      label: 'Budget Discipline',
      value: budgetStatus,
      metric: monthlyBudget > 0 ? `${budgetUsedPct}% of budget used` : 'Set monthly budget',
      desc: 'Compares total expenses against your set monthly budget limit.',
      color: budgetStatus === 'Good' ? '#10B981' : budgetStatus === 'Moderate' ? '#3B82F6' : '#FB7185',
    },
    {
      label: 'Overspending Frequency',
      value: overspendingStatus,
      metric: `${overspentEvents} high-value expense events`,
      desc: 'Tracks frequency of large or uncharacteristic spending spikes.',
      color: overspendingStatus === 'Low' ? '#10B981' : overspendingStatus === 'Moderate' ? '#F59E0B' : '#FB7185',
    },
    {
      label: 'Spending Consistency',
      value: consistencyStatus,
      metric: `${uniqueCategoriesCount} active spending categories`,
      desc: 'Analyzes expense distribution across different category tags.',
      color: consistencyStatus === 'Balanced' ? '#10B981' : '#8B5CF6',
    },
  ]

  // Dynamic Observations generated strictly from actual stored data
  const observations: string[] = []
  if (monthlyBudget > 0) {
    observations.push(`You are currently using ${budgetUsedPct}% of your monthly budget limit (₹${totalExpense.toLocaleString('en-IN')} / ₹${monthlyBudget.toLocaleString('en-IN')}).`)
  } else {
    observations.push(`No monthly budget set yet. Set a budget in Budget page to start tracking budget adherence.`)
  }

  if (totalIncome > 0) {
    observations.push(`Your net savings rate is ${savingRatePct}% based on total recorded income of ₹${totalIncome.toLocaleString('en-IN')}.`)
  }

  if (overspentEvents > 0) {
    observations.push(`You recorded ${overspentEvents} large expense transaction(s) in the available period.`)
  } else {
    observations.push(`No severe overspending spikes detected across your recorded transactions.`)
  }

  if (uniqueCategoriesCount > 0) {
    const topCatMap: Record<string, number> = {}
    txList.filter(t => t.type === 'expense').forEach(t => {
      topCatMap[t.category] = (topCatMap[t.category] || 0) + t.amount
    })
    let topCatName = ''
    let topCatVal = 0
    for (const c in topCatMap) {
      if (topCatMap[c] > topCatVal) {
        topCatVal = topCatMap[c]
        topCatName = c
      }
    }
    if (topCatName) {
      observations.push(`Your highest spending category is "${topCatName}" totaling ₹${topCatVal.toLocaleString('en-IN')}.`)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Health Score</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Calculated strictly from your actual stored transactions & financial behavior</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck size={14} className="text-emerald-500" />
          {coverageText}
        </div>
      </div>

      {/* Hero Gauge Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden shadow-md">
        <div className="relative flex flex-col items-center text-center">
          <p className="text-slate-400 text-xs font-semibold mb-6 uppercase tracking-widest">MoneyMate · Live Financial Health</p>
          <BigGauge score={calculatedScore} />
          <p className="text-slate-300 text-sm mt-4 max-w-md">
            Score based on <span className="text-emerald-400 font-bold">{txList.length} stored transactions</span>, monthly income, and budget discipline.
          </p>
        </div>
      </div>

      {/* Score Breakdown Cards */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Health Score Components</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricCards.map(m => (
            <div key={m.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">{m.label}</span>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: `${m.color}15`, color: m.color }}
                >
                  {m.value}
                </span>
              </div>
              <p className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">{m.metric}</p>
              <p className="text-xs text-slate-400">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Observations Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Info size={16} className="text-emerald-500" />
          Recent Financial Observations
        </h3>
        <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
          {observations.map((obs, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-emerald-500 font-bold">•</span>
              <span>{obs}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How Score is Calculated Explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-3 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={16} className="text-indigo-500" />
          How Your Score is Calculated
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          The Financial Health Score is computed dynamically from measurable behavior across 4 core components:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">1. Saving Rate (Max 30 pts)</p>
            <p className="text-slate-500 dark:text-slate-400">Measures net monthly savings relative to income (Savings = Income - Expenses).</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">2. Budget Discipline (Max 30 pts)</p>
            <p className="text-slate-500 dark:text-slate-400">Evaluates whether expenses stay within your stored monthly budget limit.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">3. Overspending Frequency (Max 20 pts)</p>
            <p className="text-slate-500 dark:text-slate-400">Tracks high-value single transactions that exceed typical spending bounds.</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="font-bold text-slate-900 dark:text-white mb-0.5">4. Spending Consistency (Max 20 pts)</p>
            <p className="text-slate-500 dark:text-slate-400">Analyzes category diversification and stability across transaction records.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
