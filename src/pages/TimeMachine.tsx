import React, { useState, useEffect } from 'react'
import {
  History, Sparkles, TrendingUp, TrendingDown, ArrowRight, ShieldCheck,
  ShoppingBag, CheckCircle, AlertTriangle, HelpCircle, Plus, DollarSign,
  PieChart, Sliders, RefreshCw, Layers, Calculator
} from 'lucide-react'
import { api } from '../services/api'
import { dataStore, type TransactionItem, type GoalItem } from '../services/dataStore'
import type { Page } from '../types'

interface TimeMachineProps {
  onNav?: (p: Page) => void
}

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Groceries',
  'Health',
  'Entertainment',
  'Education',
  'Housing',
  'Other',
]

export default function TimeMachine({ onNav }: TimeMachineProps) {
  // Scenario Percentages
  const [improvePct, setImprovePct] = useState<number>(10)
  const [worsenPct, setWorsenPct] = useState<number>(10)

  // Purchase Simulation State
  const [purchaseItem, setPurchaseItem] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseCategory, setPurchaseCategory] = useState('Shopping')

  // Habit Change Simulator State
  const [selectedHabitCategory, setSelectedHabitCategory] = useState<string>('')
  const [habitReductionPct, setHabitReductionPct] = useState<number>(20)

  // Data state
  const [txList, setTxList] = useState<TransactionItem[]>([])
  const [goalsList, setGoalsList] = useState<GoalItem[]>([])
  const [profile, setProfile] = useState(dataStore.getProfile())

  useEffect(() => {
    const localTxs = dataStore.getTransactions()
    const localGoals = dataStore.getGoals()
    const localProfile = dataStore.getProfile()

    setTxList(localTxs)
    setGoalsList(localGoals)
    setProfile(localProfile)

    // Set default habit category to top spending category if available
    const catMap: Record<string, number> = {}
    localTxs.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount
    })
    let topCat = 'Food & Dining'
    let topVal = 0
    for (const c in catMap) {
      if (catMap[c] > topVal) {
        topVal = catMap[c]
        topCat = c
      }
    }
    setSelectedHabitCategory(topCat)

    // Background sync
    dataStore.syncWithBackend().then(() => {
      setTxList(dataStore.getTransactions())
      setGoalsList(dataStore.getGoals())
      setProfile(dataStore.getProfile())
    }).catch(console.warn)
  }, [])

  // --- CORE FINANCIAL CALCULATIONS FROM REAL STORED DATA ---
  const incomeTxTotal = txList.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenseTxTotal = txList.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const monthlyIncome = profile.monthlyIncome > 0 ? profile.monthlyIncome : incomeTxTotal
  const monthlyExpense = expenseTxTotal
  const monthlyBudget = profile.monthlyBudget || 0
  const netSavings = Math.max(0, monthlyIncome - monthlyExpense)

  const budgetUsedPct = monthlyBudget > 0 ? Math.round((monthlyExpense / monthlyBudget) * 100) : 0
  const remainingBudget = monthlyBudget > 0 ? monthlyBudget - monthlyExpense : 0
  const savingsRatePct = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0

  // Category Breakdown
  const catSpendingMap: Record<string, number> = {}
  txList.filter(t => t.type === 'expense').forEach(t => {
    catSpendingMap[t.category] = (catSpendingMap[t.category] || 0) + t.amount
  })
  let topCategoryName = 'None'
  let topCategoryAmount = 0
  for (const cat in catSpendingMap) {
    if (catSpendingMap[cat] > topCategoryAmount) {
      topCategoryAmount = catSpendingMap[cat]
      topCategoryName = cat
    }
  }

  // Active Goal Metrics
  const primaryGoal = goalsList.length > 0 ? goalsList[0] : null
  const goalTarget = primaryGoal ? primaryGoal.targetAmount : 0
  const goalSaved = primaryGoal ? primaryGoal.savedAmount : 0
  const goalRemaining = primaryGoal ? Math.max(0, goalTarget - goalSaved) : 0
  const currentMonthsToGoal = netSavings > 0 && goalRemaining > 0 ? Math.ceil(goalRemaining / netSavings) : 0

  // Helper to format months to estimated date
  const formatProjectedDate = (months: number) => {
    if (months <= 0 || !isFinite(months)) return 'Target Reached'
    if (months > 120) return 'Over 10+ years'
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + months)
    return targetDate.toLocaleString('en-US', { month: 'short', year: 'numeric' })
  }

  // --- SCENARIO 2: IMPROVE HABITS CALCULATIONS ---
  const improveAmountSavedMonthly = Math.round(monthlyExpense * (improvePct / 100))
  const improvedMonthlyExpense = Math.max(0, monthlyExpense - improveAmountSavedMonthly)
  const improvedMonthlySavings = netSavings + improveAmountSavedMonthly
  const improvedAnnualSavings = improvedMonthlySavings * 12
  const improvedMonthsToGoal = improvedMonthlySavings > 0 && goalRemaining > 0 ? Math.ceil(goalRemaining / improvedMonthlySavings) : 0
  const monthsFaster = currentMonthsToGoal > 0 && improvedMonthsToGoal > 0 ? Math.max(0, currentMonthsToGoal - improvedMonthsToGoal) : 0

  // --- SCENARIO 3: WORSEN HABITS CALCULATIONS ---
  const worsenExtraSpendMonthly = Math.round(monthlyExpense * (worsenPct / 100))
  const worsenedMonthlyExpense = monthlyExpense + worsenExtraSpendMonthly
  const worsenedMonthlySavings = Math.max(0, netSavings - worsenExtraSpendMonthly)
  const worsenedAnnualSpend = worsenExtraSpendMonthly * 12
  const worsenedMonthsToGoal = worsenedMonthlySavings > 0 && goalRemaining > 0 ? Math.ceil(goalRemaining / worsenedMonthlySavings) : 999
  const monthsDelayed = worsenedMonthsToGoal > currentMonthsToGoal ? (worsenedMonthsToGoal > 120 ? 120 : worsenedMonthsToGoal - currentMonthsToGoal) : 0

  // --- PURCHASE SIMULATION CALCULATIONS ---
  const numPrice = parseFloat(purchasePrice) || 0
  const simulatedRemainingBudget = remainingBudget - numPrice
  const simulatedNetSavings = Math.max(0, netSavings - numPrice)
  const simulatedMonthsToGoal = simulatedNetSavings > 0 && goalRemaining > 0 ? Math.ceil(goalRemaining / simulatedNetSavings) : currentMonthsToGoal + 1
  const purchaseGoalDelayMonths = simulatedMonthsToGoal > currentMonthsToGoal ? simulatedMonthsToGoal - currentMonthsToGoal : 0

  // --- HABIT SIMULATOR CALCULATIONS ---
  const activeHabitCurrentSpend = catSpendingMap[selectedHabitCategory] || 0
  const habitMonthlySavings = Math.round(activeHabitCurrentSpend * (habitReductionPct / 100))
  const habitAnnualSavings = habitMonthlySavings * 12
  const habitNewMonthlySavings = netSavings + habitMonthlySavings
  const habitNewMonthsToGoal = habitNewMonthlySavings > 0 && goalRemaining > 0 ? Math.ceil(goalRemaining / habitNewMonthlySavings) : 0
  const habitMonthsSaved = currentMonthsToGoal > 0 && habitNewMonthsToGoal > 0 ? Math.max(0, currentMonthsToGoal - habitNewMonthsToGoal) : 0

  // --- EMPTY / MINIMAL DATA STATE ---
  const hasData = txList.length > 0 || monthlyIncome > 0

  if (!hasData) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-500 mb-2">
          <History size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Time Machine needs some financial history</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Add or import transactions to explore how your spending habits, purchase decisions, and lifestyle changes will affect your financial future.
        </p>
        {onNav && (
          <button
            onClick={() => onNav('add-expense')}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm py-3 px-5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} />
            + Record or Import Transactions
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-8">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="text-indigo-500" size={24} />
            Financial Time Machine
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Simulate future wealth trajectories, test lifestyle changes, and evaluate purchase decisions in real time
          </p>
        </div>
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 dark:text-indigo-300">
          <ShieldCheck size={14} className="text-indigo-500" />
          Interactive Simulation Engine
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3-COLUMN SCENARIO COMPARISON CARDS                           */}
      {/* ============================================================ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-indigo-500" />
            Spending Trajectory Scenarios
          </h2>
          <span className="text-xs text-slate-400">Calculated from {txList.length} recorded transactions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* COLUMN 1: CURRENT SPENDING */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Spending</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full">
                  Baseline
                </span>
              </div>

              <div className="space-y-3 pt-3">
                <div>
                  <p className="text-xs text-slate-400">Monthly Spending</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ₹{monthlyExpense.toLocaleString('en-IN')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[11px] text-slate-400">Monthly Savings</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{netSavings.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Savings Rate</p>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {monthlyIncome > 0 ? `${savingsRatePct}%` : 'Income N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400">Top Category</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {topCategoryName} — ₹{topCategoryAmount.toLocaleString('en-IN')}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-400">Budget Usage</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {monthlyBudget > 0 ? `${budgetUsedPct}% used` : 'No budget set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Projection</p>
              <p className="text-xs font-semibold text-slate-900 dark:text-white">
                Annual Savings: ₹{(netSavings * 12).toLocaleString('en-IN')}
              </p>
              {primaryGoal ? (
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  "{primaryGoal.name}" reached {formatProjectedDate(currentMonthsToGoal)}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Add a goal to project completion date</p>
              )}
            </div>
          </div>

          {/* COLUMN 2: IF YOU IMPROVE YOUR HABITS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/40 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 dark:border-emerald-900/40">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={14} /> If You Improve Habits
                </span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                  -{improvePct}% Spend
                </span>
              </div>

              {/* Controls */}
              <div className="pt-3">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Reduce Spending By:</p>
                <div className="flex gap-1.5">
                  {[5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setImprovePct(pct)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                        improvePct === pct
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <div>
                  <p className="text-xs text-slate-400">Reduced Monthly Spend</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ₹{improvedMonthlyExpense.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-emerald-500 ml-1.5">(-₹{improveAmountSavedMonthly.toLocaleString('en-IN')})</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[11px] text-slate-400">Potential Savings</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{improvedMonthlySavings.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Annual Gain</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      +₹{(improveAmountSavedMonthly * 12).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400">Goal Impact</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {monthsFaster > 0 ? `Reaches goal ~${monthsFaster} month(s) earlier` : 'Accelerates financial milestones'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-bold">Improved Projection</p>
              <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Annual Savings: ₹{improvedAnnualSavings.toLocaleString('en-IN')}
              </p>
              {primaryGoal && (
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                  Goal reached around {formatProjectedDate(improvedMonthsToGoal)}
                </p>
              )}
            </div>
          </div>

          {/* COLUMN 3: IF YOUR HABITS WORSEN */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-rose-400/40 p-6 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 dark:border-rose-900/40">
                <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                  <TrendingDown size={14} /> If Habits Worsen
                </span>
                <span className="text-[10px] bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-bold px-2 py-0.5 rounded-full">
                  +{worsenPct}% Spend
                </span>
              </div>

              {/* Controls */}
              <div className="pt-3">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">Increase Spending By:</p>
                <div className="flex gap-1.5">
                  {[5, 10, 15, 20].map(pct => (
                    <button
                      key={pct}
                      onClick={() => setWorsenPct(pct)}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                        worsenPct === pct
                          ? 'bg-rose-500 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-3">
                <div>
                  <p className="text-xs text-slate-400">Increased Monthly Spend</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white">
                    ₹{worsenedMonthlyExpense.toLocaleString('en-IN')}
                    <span className="text-xs font-normal text-rose-500 ml-1.5">(+₹{worsenExtraSpendMonthly.toLocaleString('en-IN')})</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className="text-[11px] text-slate-400">Monthly Savings</p>
                    <p className="text-sm font-bold text-rose-500">
                      ₹{worsenedMonthlySavings.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400">Annual Drain</p>
                    <p className="text-sm font-bold text-rose-500">
                      -₹{worsenedAnnualSpend.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] text-slate-400">Goal Impact</p>
                  <p className="text-xs font-bold text-rose-500">
                    {monthsDelayed > 0 ? `Delays goal by ~${monthsDelayed} month(s)` : 'Reduces savings capacity'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 space-y-1">
              <p className="text-[10px] uppercase tracking-wider text-rose-500 font-bold">Worsened Projection</p>
              <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                Annual Savings: ₹{(worsenedMonthlySavings * 12).toLocaleString('en-IN')}
              </p>
              {primaryGoal && (
                <p className="text-[11px] text-rose-600 dark:text-rose-300 font-medium">
                  Goal delayed to ~{formatProjectedDate(worsenedMonthsToGoal)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMPARATIVE MATRIX TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calculator size={16} className="text-indigo-500" />
          Side-by-Side Scenario Comparison
        </h3>
        <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase">
              <tr>
                <th className="p-3">Financial Metric</th>
                <th className="p-3">Current Baseline</th>
                <th className="p-3 text-emerald-600 dark:text-emerald-400">Improved (-{improvePct}%)</th>
                <th className="p-3 text-rose-500">Worsened (+{worsenPct}%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white font-medium">
              <tr>
                <td className="p-3 text-slate-500 dark:text-slate-400">Monthly Spending</td>
                <td className="p-3 font-mono font-bold">₹{monthlyExpense.toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono font-bold text-emerald-600">₹{improvedMonthlyExpense.toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono font-bold text-rose-500">₹{worsenedMonthlyExpense.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-500 dark:text-slate-400">Monthly Savings</td>
                <td className="p-3 font-mono">₹{netSavings.toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">₹{improvedMonthlySavings.toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono text-rose-500">₹{worsenedMonthlySavings.toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-500 dark:text-slate-400">Annual Savings</td>
                <td className="p-3 font-mono">₹{(netSavings * 12).toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono text-emerald-600 font-bold">₹{improvedAnnualSavings.toLocaleString('en-IN')}</td>
                <td className="p-3 font-mono text-rose-500">₹{(worsenedMonthlySavings * 12).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-500 dark:text-slate-400">Budget Usage</td>
                <td className="p-3">{monthlyBudget > 0 ? `${budgetUsedPct}%` : 'N/A'}</td>
                <td className="p-3 text-emerald-600">{monthlyBudget > 0 ? `${Math.round((improvedMonthlyExpense / monthlyBudget) * 100)}%` : 'N/A'}</td>
                <td className="p-3 text-rose-500">{monthlyBudget > 0 ? `${Math.round((worsenedMonthlyExpense / monthlyBudget) * 100)}%` : 'N/A'}</td>
              </tr>
              <tr>
                <td className="p-3 text-slate-500 dark:text-slate-400">Goal Target Date</td>
                <td className="p-3">{primaryGoal ? formatProjectedDate(currentMonthsToGoal) : 'No Goal Set'}</td>
                <td className="p-3 text-emerald-600 font-bold">{primaryGoal ? formatProjectedDate(improvedMonthsToGoal) : 'No Goal Set'}</td>
                <td className="p-3 text-rose-500">{primaryGoal ? formatProjectedDate(worsenedMonthsToGoal) : 'No Goal Set'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 2: "SHOULD I BUY THIS?" (PURCHASE SIMULATOR)         */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={18} className="text-indigo-500" />
            "Should I Buy This?" — Pre-Purchase Decision Simulator
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Test how a potential purchase will affect your remaining monthly budget, savings, and financial goals before spending.
          </p>
        </div>

        {/* Input Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Item Description</label>
            <input
              type="text"
              placeholder="e.g. Wireless Headphones, Jacket"
              value={purchaseItem}
              onChange={e => setPurchaseItem(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 4000"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={purchaseCategory}
              onChange={e => setPurchaseCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Live Simulation Results */}
        {numPrice > 0 ? (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-xl space-y-2">
              <h3 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-500" />
                Purchase Impact Analysis ({purchaseItem || 'Item'} — ₹{numPrice.toLocaleString('en-IN')})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-[11px] text-slate-400">Remaining Budget Impact</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{remainingBudget.toLocaleString('en-IN')} → ₹{simulatedRemainingBudget.toLocaleString('en-IN')}
                  </p>
                  <p className={`text-[10px] mt-1 font-semibold ${simulatedRemainingBudget < 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
                    {simulatedRemainingBudget < 0
                      ? `Exceeds budget by ₹${Math.abs(simulatedRemainingBudget).toLocaleString('en-IN')}`
                      : `Fits within budget (${Math.round((numPrice / (remainingBudget || 1)) * 100)}% of remaining)`}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-[11px] text-slate-400">Savings Impact</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    ₹{netSavings.toLocaleString('en-IN')} → ₹{simulatedNetSavings.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Represents {netSavings > 0 ? Math.round((numPrice / netSavings) * 100) : 100}% of monthly savings
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-[11px] text-slate-400">Goal Timeline Delay</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                    {purchaseGoalDelayMonths > 0 ? `+${purchaseGoalDelayMonths} month(s) delay` : 'No significant goal delay'}
                  </p>
                  {primaryGoal && (
                    <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1 font-medium">
                      {numPrice > 0 && goalRemaining > 0
                        ? `Equals ${Math.round((numPrice / goalRemaining) * 100)}% of remaining goal needed`
                        : 'Simulated against active goal'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* IF YOU BUY THIS vs IF YOU DON'T BUY THIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl space-y-2">
                <p className="font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider text-[11px]">If You Buy This</p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>• ₹{numPrice.toLocaleString('en-IN')} spent immediately</li>
                  <li>• Remaining monthly budget becomes ₹{simulatedRemainingBudget.toLocaleString('en-IN')}</li>
                  {purchaseGoalDelayMonths > 0 && <li>• Goal completion delayed by ~{purchaseGoalDelayMonths} month(s)</li>}
                </ul>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 rounded-xl space-y-2">
                <p className="font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider text-[11px]">If You Don't Buy This</p>
                <ul className="space-y-1 text-slate-600 dark:text-slate-300">
                  <li>• ₹{numPrice.toLocaleString('en-IN')} remains available in savings</li>
                  <li>• Full remaining budget of ₹{remainingBudget.toLocaleString('en-IN')} preserved</li>
                  {primaryGoal && <li>• Goal remains on track for {formatProjectedDate(currentMonthsToGoal)}</li>}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Enter item description & price above to calculate instant financial impact.</p>
        )}
      </div>

      {/* ============================================================ */}
      {/* SECTION 3: "WHAT IF I CHANGE ONE HABIT?"                     */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders size={18} className="text-emerald-500" />
          "What If I Change This One Habit?" — Category Simulator
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Pick a category where you spend regularly and simulate how reducing spending in that specific category creates compounding savings.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Spending Category</label>
            <select
              value={selectedHabitCategory}
              onChange={e => setSelectedHabitCategory(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Simulated Reduction</label>
            <div className="flex gap-1.5">
              {[10, 20, 30, 50].map(pct => (
                <button
                  key={pct}
                  onClick={() => setHabitReductionPct(pct)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    habitReductionPct === pct
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-slate-400">Current Monthly Category Spend</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white font-mono">
              ₹{activeHabitCurrentSpend.toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-emerald-700 dark:text-emerald-300 font-semibold mb-1">Monthly Savings</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              +₹{habitMonthlySavings.toLocaleString('en-IN')}/mo
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Saved by reducing {selectedHabitCategory} by {habitReductionPct}%</p>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <p className="text-indigo-700 dark:text-indigo-300 font-semibold mb-1">Annual Impact</p>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
              +₹{habitAnnualSavings.toLocaleString('en-IN')}/yr
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Compounded over 12 months</p>
          </div>

          <div className="bg-violet-50 dark:bg-violet-950/30 p-4 rounded-xl border border-violet-100 dark:border-violet-900/30">
            <p className="text-violet-700 dark:text-violet-300 font-semibold mb-1">Goal Acceleration</p>
            <p className="text-xl font-bold text-violet-600 dark:text-violet-400">
              {habitMonthsSaved > 0 ? `~${habitMonthsSaved} month(s) faster` : 'Accelerates milestones'}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              {primaryGoal ? `Frees funds toward "${primaryGoal.name}"` : 'Increases overall savings capacity'}
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 4: IMPULSE & "SMALL PURCHASES ADD UP" INSIGHTS      */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp size={18} className="text-emerald-500" />
          The Cumulative Effect of Daily Habits
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Small recurring daily expenses add up significantly over time. See how modest daily choices compare to your long-term goal.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Daily Spending</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white my-1 font-mono">₹200 / day</p>
            <p className="text-[11px] text-slate-500">e.g., daily coffee, snacks, or cabs</p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly Total</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 my-1 font-mono">₹6,000 / mo</p>
            <p className="text-[11px] text-slate-500">30 days of ₹200 daily spend</p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Annual Impact</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 my-1 font-mono">₹73,000 / yr</p>
            <p className="text-[11px] text-slate-500">
              {primaryGoal
                ? `Represents ${Math.round((73000 / (goalTarget || 1)) * 100)}% of your "${primaryGoal.name}" goal!`
                : 'Significant potential contribution toward wealth goals'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
