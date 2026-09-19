import { useState, useEffect } from 'react'
import { AlertTriangle, Shield, ChevronDown, ChevronUp, Zap, Edit3, Check, RefreshCw, Wallet, Target, Sparkles, Sliders } from 'lucide-react'
import { dataStore } from '../services/dataStore'

const DEFAULT_ESSENTIAL_CATS = ['Housing', 'Food & Dining', 'Groceries', 'Utilities', 'Health', 'Education']

const CATEGORY_EMOJIS: Record<string, string> = {
  'Housing': '🏠',
  'Food & Dining': '🍕',
  'Groceries': '🛒',
  'Utilities': '⚡',
  'Health': '💊',
  'Education': '📚',
  'Transport': '🚗',
  'Shopping': '🛍️',
  'Entertainment': '🎬',
  'Salary': '💰',
  'Freelance': '💼',
  'Other': '📦',
}

export default function SafetyNet() {
  const [summaryData, setSummaryData] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [goals, setGoals] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)

  // User persistent configuration
  const [customLiquidFunds, setCustomLiquidFunds] = useState<number | null>(null)
  const [essentialCategories, setEssentialCategories] = useState<string[]>(DEFAULT_ESSENTIAL_CATS)
  const [editingLiquid, setEditingLiquid] = useState(false)
  const [inputLiquid, setInputLiquid] = useState<string>('')

  // Crisis Simulator States
  const [crisisMode, setCrisisMode] = useState(false)
  const [jobLoss, setJobLoss] = useState(false)
  const [medicalBill, setMedicalBill] = useState(false)
  const [medAmount, setMedAmount] = useState(50000)
  const [expanded, setExpanded] = useState<number | null>(null)

  const activeEmail = dataStore.getActiveEmail() || 'default'

  const loadData = () => {
    const summaryRes = dataStore.getDashboardSummary()
    setSummaryData(summaryRes.summary)
    setTransactions(summaryRes.transactions)
    setGoals(summaryRes.goals)
    setProfile(dataStore.getProfile())

    // Load user liquid funds override
    const storedLiquid = localStorage.getItem(`moneymate_liquid_funds_${activeEmail}`)
    if (storedLiquid !== null && storedLiquid !== '') {
      const val = parseFloat(storedLiquid)
      if (!isNaN(val)) setCustomLiquidFunds(val)
    }

    // Load user essential category classifications
    const storedEssentials = localStorage.getItem(`moneymate_essential_cats_${activeEmail}`)
    if (storedEssentials) {
      try {
        setEssentialCategories(JSON.parse(storedEssentials))
      } catch {
        setEssentialCategories(DEFAULT_ESSENTIAL_CATS)
      }
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSaveLiquidFunds = () => {
    const val = parseFloat(inputLiquid)
    if (!isNaN(val) && val >= 0) {
      setCustomLiquidFunds(val)
      localStorage.setItem(`moneymate_liquid_funds_${activeEmail}`, val.toString())
    }
    setEditingLiquid(false)
  }

  const handleToggleEssential = (catName: string) => {
    let updated: string[]
    if (essentialCategories.includes(catName)) {
      updated = essentialCategories.filter(c => c !== catName)
    } else {
      updated = [...essentialCategories, catName]
    }
    setEssentialCategories(updated)
    localStorage.setItem(`moneymate_essential_cats_${activeEmail}`, JSON.stringify(updated))
  }

  // 1. LIQUID FUNDS COMPUTATION
  const calculatedBalance = summaryData?.totalBalance || profile?.monthlyIncome || 0
  const liquidTotal = customLiquidFunds !== null ? customLiquidFunds : calculatedBalance

  // 2. ESSENTIAL vs DISCRETIONARY EXPENSE COMPUTATION FROM REAL TRANSACTIONS
  const expenseTxs = (transactions || []).filter(t => t.type === 'expense' || t.type !== 'income')

  const categoryTotals: Record<string, number> = {}
  expenseTxs.forEach(t => {
    const cat = t.category || 'Other'
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount || 0)
  })

  // Gather all category names found in user transactions or default categories
  const allCategories = Array.from(new Set([...Object.keys(categoryTotals), ...DEFAULT_ESSENTIAL_CATS]))

  let essentialsTotal = 0
  let discretionaryTotal = 0

  allCategories.forEach(cat => {
    const amt = categoryTotals[cat] || 0
    if (essentialCategories.includes(cat)) {
      essentialsTotal += amt
    } else {
      discretionaryTotal += amt
    }
  })

  // Fallback: If no expense transactions recorded yet, estimate essential burn from monthly profile/budget
  if (essentialsTotal <= 0) {
    if (profile?.monthlyBudget > 0) {
      essentialsTotal = Math.round(profile.monthlyBudget * 0.7)
      discretionaryTotal = Math.round(profile.monthlyBudget * 0.3)
    } else if (profile?.monthlyIncome > 0) {
      essentialsTotal = Math.round(profile.monthlyIncome * 0.5)
      discretionaryTotal = Math.round(profile.monthlyIncome * 0.2)
    } else {
      essentialsTotal = 25000 // Minimal baseline when zero data exists
    }
  }

  // 3. RUNWAY CALCULATIONS
  const survivalMonthsNum = essentialsTotal > 0 ? liquidTotal / essentialsTotal : 0
  const survivalMonthsFormatted = survivalMonthsNum >= 99 ? '99+' : survivalMonthsNum.toFixed(1)

  // Simulation calculations
  const adjustedLiquid = Math.max(0, liquidTotal - (medicalBill ? medAmount : 0))
  const monthlyInflow = jobLoss ? 0 : summaryData?.monthlyIncome || profile?.monthlyIncome || 0

  let adjustedRunway = ''
  if (!jobLoss && monthlyInflow >= (crisisMode ? essentialsTotal : essentialsTotal + discretionaryTotal)) {
    adjustedRunway = '∞ (income positive)'
  } else {
    const effectiveBurn = crisisMode ? essentialsTotal : essentialsTotal + discretionaryTotal
    const simulatedMonths = effectiveBurn > 0 ? adjustedLiquid / effectiveBurn : 0
    adjustedRunway = `${simulatedMonths.toFixed(1)} months`
  }

  const target6M = essentialsTotal * 6
  const gapToTarget = Math.max(0, target6M - liquidTotal)

  // Waterfall priority steps built from actual user data
  const goalReservesTotal = (goals || []).reduce((sum, g) => sum + (g.savedAmount || 0), 0)
  const waterfall = [
    {
      step: 1,
      label: 'Liquid Savings & Bank Balance',
      desc: 'Immediate zero-friction cash & checking balance available for emergency use.',
      amount: liquidTotal,
      color: 'emerald',
    },
    {
      step: 2,
      label: 'Pause Discretionary Spending',
      desc: `Cancel non-essential expenses (${allCategories.filter(c => !essentialCategories.includes(c)).join(', ') || 'Shopping, Dining, Subscriptions'}).`,
      amount: discretionaryTotal,
      color: 'amber',
    },
    {
      step: 3,
      label: 'Active Goal Emergency Reserves',
      desc: `Redeem accumulated deposits from active financial goals (${goals.length} active goals).`,
      amount: goalReservesTotal,
      color: 'sky',
    },
    {
      step: 4,
      label: 'Unallocated Budget Surplus',
      desc: 'Unused monthly budget capacity available to reallocate.',
      amount: Math.max(0, (profile?.monthlyBudget || 0) - essentialsTotal),
      color: 'indigo',
    },
  ]

  const nonEssentialCats = allCategories.filter(c => !essentialCategories.includes(c))

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="text-emerald-500" size={24} />
            Safety Net & Contingency
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Emergency survival runway and crisis simulation based on your actual financial data
          </p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
          survivalMonthsNum >= 6 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-400'
            : survivalMonthsNum >= 3 ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-400'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800/40 dark:text-rose-400'
        }`}>
          <Shield size={14} />
          {survivalMonthsNum >= 6 ? 'Well Protected' : survivalMonthsNum >= 3 ? 'Moderate Risk' : 'Critical — Act Now'}
        </div>
      </div>

      {/* Liquid Survival Runway Hero */}
      <div className={`rounded-2xl p-6 relative overflow-hidden text-white ${
        crisisMode ? 'bg-gradient-to-r from-rose-600 via-rose-700 to-rose-900' : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-1/3 w-64 h-32 rounded-full blur-3xl ${crisisMode ? 'bg-rose-400/20' : 'bg-emerald-500/10'}`} />
        </div>
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-slate-300 text-sm font-medium">
                {crisisMode ? '⚠️ SURVIVAL BUDGET MODE ACTIVE' : 'Liquid Survival Runway'}
              </p>
              <button
                onClick={() => {
                  setInputLiquid(liquidTotal.toString())
                  setEditingLiquid(!editingLiquid)
                }}
                className="text-xs bg-white/10 hover:bg-white/20 text-slate-200 px-2 py-0.5 rounded-lg flex items-center gap-1 transition-colors"
                title="Edit liquid savings amount"
              >
                <Edit3 size={11} /> Edit Liquid Funds
              </button>
            </div>

            {editingLiquid && (
              <div className="flex items-center gap-2 my-2 bg-slate-800/90 p-2 rounded-xl border border-white/20">
                <span className="text-xs text-slate-300">₹</span>
                <input
                  type="number"
                  value={inputLiquid}
                  onChange={e => setInputLiquid(e.target.value)}
                  placeholder="Enter Liquid Savings"
                  className="bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 w-36 focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <button
                  onClick={handleSaveLiquidFunds}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Check size={12} /> Save
                </button>
              </div>
            )}

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-6xl font-black text-white">{crisisMode ? adjustedRunway : `${survivalMonthsFormatted}M`}</span>
              {!crisisMode && <span className="text-slate-400 text-base">months of runway</span>}
            </div>
            <p className="text-slate-300 text-sm">
              ₹{liquidTotal.toLocaleString('en-IN')} liquid ÷ ₹{essentialsTotal.toLocaleString('en-IN')}/mo non-negotiables
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
            {[
              { label: 'Liquid Assets', val: `₹${(liquidTotal / 1000).toFixed(1)}K` },
              { label: 'Monthly Essentials', val: `₹${(essentialsTotal / 1000).toFixed(1)}K` },
              { label: 'Buffer Target (6M)', val: `₹${(target6M / 1000).toFixed(1)}K` },
              { label: 'Gap to Target', val: `₹${(gapToTarget / 1000).toFixed(1)}K` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-center min-w-[120px]">
                <p className="text-sm font-black text-white">{s.val}</p>
                <p className="text-xs text-slate-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crisis Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Crisis Simulator</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <button
            onClick={() => setJobLoss(j => !j)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              jobLoss ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💼</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                jobLoss ? 'bg-rose-500 border-rose-500' : 'border-slate-300'
              }`}>
                {jobLoss && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Sudden Job / Income Loss</p>
            <p className="text-xs text-slate-400 mt-0.5">Zero income scenario — essential spending only</p>
          </button>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            medicalBill ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏥</span>
              <button
                onClick={() => setMedicalBill(m => !m)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  medicalBill ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
                }`}
              >
                {medicalBill && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Emergency Medical Expense</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">₹</span>
              <input
                type="number"
                value={medAmount}
                onChange={e => setMedAmount(Number(e.target.value))}
                onClick={() => setMedicalBill(true)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {(jobLoss || medicalBill) && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm mb-1">
              <AlertTriangle size={14} />
              Simulated Runway: {adjustedRunway}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Simulated liquid reserves: ₹{Math.max(0, adjustedLiquid).toLocaleString('en-IN')} — {jobLoss ? 'zero income' : 'income intact'} scenario
            </p>
          </div>
        )}

        <button
          onClick={() => setCrisisMode(m => !m)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            crisisMode
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20'
          }`}
        >
          <Zap size={15} />
          {crisisMode ? 'Deactivate Survival Budget Mode' : 'Activate Survival Budget Mode'}
        </button>

        {crisisMode && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2">Non-essential categories — PAUSED:</p>
            <div className="flex flex-wrap gap-2">
              {nonEssentialCats.length > 0 ? (
                nonEssentialCats.map(c => (
                  <span key={c} className="text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1 rounded-full line-through">
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-rose-500 italic">No non-essential categories marked.</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Waterfall Liquidation Plan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Waterfall Liquidation Priority Plan</h2>
        <div className="space-y-2">
          {waterfall.map((item, idx) => (
            <div key={item.step}>
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
                    : item.color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40'
                    : item.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40'
                    : item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${
                  item.color === 'emerald' ? 'bg-emerald-500' : item.color === 'sky' ? 'bg-sky-500'
                    : item.color === 'indigo' ? 'bg-indigo-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  {expanded === idx && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{item.amount.toLocaleString('en-IN')}</span>
                {expanded === idx ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Essentials Breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Non-Negotiable vs Discretionary Expenses</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any category tag below to toggle between Essential (non-negotiable) and Discretionary
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {allCategories.map(cat => {
            const amt = categoryTotals[cat] || 0
            const isEssential = essentialCategories.includes(cat)
            const emoji = CATEGORY_EMOJIS[cat] || '🏷️'

            return (
              <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">₹{amt.toLocaleString('en-IN')}</span>
                  <button
                    onClick={() => handleToggleEssential(cat)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                      isEssential
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {isEssential ? 'Essential' : 'Discretionary'}
                  </button>
                </div>
              </div>
            )
          })}

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white mt-4">
            <span className="text-sm font-bold">Total Non-Negotiable Monthly Burn</span>
            <span className="text-sm font-black">₹{essentialsTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
