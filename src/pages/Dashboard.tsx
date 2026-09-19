import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Heart, Plus, Scan, Sparkles, ArrowRight, Target } from 'lucide-react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { api } from '../services/api'
import { dataStore } from '../services/dataStore'
import type { Page } from '../types'

interface DashboardProps {
  onNav: (p: Page) => void
  user?: any
}

export default function Dashboard({ onNav, user }: DashboardProps) {
  const [summary, setSummary] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [weeklyTrends, setWeeklyTrends] = useState<any[]>([])
  const [txList, setTxList] = useState<any[]>([])
  const [goalsList, setGoalsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = () => {
    setLoading(true)
    const local = dataStore.getDashboardSummary()
    setSummary(local.summary)
    setTxList(local.transactions)
    setGoalsList(local.goals)

    // Calculate category breakdown from local transactions
    const totalSpent = local.summary.monthlyExpense
    const catMap: Record<string, number> = {}
    const categoryColors: Record<string, string> = {
      'Food & Dining': '#F97316',
      'Housing': '#6366F1',
      'Transport': '#3B82F6',
      'Shopping': '#EC4899',
      'Entertainment': '#8B5CF6',
      'Health': '#10B981',
      'Utilities': '#F59E0B',
      'Groceries': '#10B981',
      'Education': '#6366F1',
      'Other': '#64748B',
    }

    local.transactions.filter(t => t.type === 'expense').forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount
    })

    const catList = Object.keys(catMap).map(cat => ({
      name: cat,
      amount: catMap[cat],
      value: totalSpent > 0 ? Math.round((catMap[cat] / totalSpent) * 100) : 0,
      color: categoryColors[cat] || '#64748B',
    }))
    setCategories(catList)

    setLoading(false)

    // Background sync with API and API analytics
    dataStore.syncWithBackend().then(() => {
      Promise.all([
        api.analytics.getSpendingByCategory().catch(() => null),
        api.analytics.getMonthlyTrends().catch(() => null),
        api.analytics.getWeeklyTrends().catch(() => null),
      ]).then(([catRes, monthRes, weekRes]) => {
        if (catRes?.success && catRes.categories?.length > 0) setCategories(catRes.categories)
        if (monthRes?.success && monthRes.monthlyData?.length > 0) setMonthlyTrends(monthRes.monthlyData)
        if (weekRes?.success && weekRes.weeklyTrend?.length > 0) setWeeklyTrends(weekRes.weeklyTrend)
      }).catch(console.warn)
    }).catch(console.warn)
  }

  useEffect(() => {
    loadData()
  }, [])

  const hasIncome = (summary?.monthlyIncome || 0) > 0
  const hasBudget = (summary?.monthlyBudget || 0) > 0
  const hasTx = txList.length > 0

  const statCardsData = [
    {
      title: 'Total Balance',
      value: summary ? `₹${summary.totalBalance.toLocaleString('en-IN')}` : '₹0',
      subtitle: hasIncome ? 'Calculated Balance' : 'Add Monthly Income',
      icon: Wallet,
      bg: 'bg-emerald-500',
      action: !hasIncome ? () => onNav('onboarding') : undefined,
    },
    {
      title: 'Monthly Income',
      value: hasIncome ? `₹${summary.monthlyIncome.toLocaleString('en-IN')}` : 'Add Monthly Income',
      subtitle: hasIncome ? 'Base Income' : 'Setup Profile',
      icon: TrendingUp,
      bg: 'bg-blue-500',
      action: !hasIncome ? () => onNav('onboarding') : undefined,
    },
    {
      title: 'Monthly Expenses',
      value: hasTx ? `₹${summary?.monthlyExpense.toLocaleString('en-IN')}` : '₹0',
      subtitle: hasTx ? `${txList.length} transactions` : 'No expenses recorded',
      icon: TrendingDown,
      bg: 'bg-rose-500',
    },
    {
      title: 'Savings',
      value: hasIncome ? `₹${summary?.savings.toLocaleString('en-IN')}` : '₹0',
      subtitle: hasIncome ? 'Income - Expenses' : 'Requires income setup',
      icon: PiggyBank,
      bg: 'bg-violet-500',
    },
    {
      title: 'Health Score',
      value: summary?.healthScore !== null && summary?.healthScore !== undefined ? `${summary.healthScore} / 100` : 'No Score',
      subtitle: summary?.healthScore !== null ? 'Live Calculated' : 'Add data to unlock',
      icon: Heart,
      bg: 'bg-amber-500',
    },
  ]

  const userName = user?.name || 'User'

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {userName} 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here is your live, data-driven financial dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNav('add-expense')}
            className="flex items-center gap-2 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={14} />
            + Add Transaction
          </button>
          {!hasIncome && (
            <button
              onClick={() => onNav('onboarding')}
              className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-3.5 py-2.5 rounded-xl transition-colors"
            >
              Set Monthly Income
            </button>
          )}
        </div>
      </div>

      {/* Prompts for Initial Setup if needed */}
      {(!hasIncome || !hasBudget) && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-violet-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Complete Your Financial Profile</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {!hasIncome && !hasBudget
                ? 'Add your monthly income & budget to unlock savings tracking, budget discipline, and health score calculations.'
                : !hasIncome
                ? 'Add your monthly income to start calculating monthly savings rates.'
                : 'Set your monthly budget spending limit to enable budget monitoring.'}
            </p>
          </div>
          <button
            onClick={() => onNav('onboarding')}
            className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-sm flex-shrink-0"
          >
            Update Setup
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {statCardsData.map(card => (
          <div
            key={card.title}
            onClick={card.action}
            className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all ${
              card.action ? 'cursor-pointer hover:border-emerald-300' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white mb-0.5 truncate">{card.value}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{card.title}</p>
            <p className="text-[11px] text-slate-400 mt-1">{card.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Spending by Category</h3>
          {categories.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categories.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
                {categories.map(cat => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-auto font-medium">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[210px] flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Not enough data yet</p>
              <p className="text-xs text-slate-400 mt-1 mb-3">Add expense transactions to view category breakdowns.</p>
              <button
                onClick={() => onNav('add-expense')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                + Add Expense
              </button>
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Income vs Expenses</h3>
            {monthlyTrends.length > 0 && (
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Income</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Expenses</span>
              </div>
            )}
          </div>
          {monthlyTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyTrends} barSize={10} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${v / 1000}k`}
                  width={38}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, '']}
                />
                <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#FB7185" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No monthly trends recorded</p>
              <p className="text-xs text-slate-400 mt-1">Income and expense trends will build over time.</p>
            </div>
          )}
        </div>

        {/* Line chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Weekly Spending Trend</h3>
          {weeklyTrends.some(w => w.amount > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${v}`}
                  width={42}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={v => [`₹${Number(v).toLocaleString('en-IN')}`, 'Spent']}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#10B981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex flex-col items-center justify-center text-center p-4">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No weekly spending recorded</p>
              <p className="text-xs text-slate-400 mt-1">Weekly trends will appear as you record expenses.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions Section */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
            {hasTx && (
              <button
                onClick={() => onNav('transactions')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                View all <ArrowRight size={12} />
              </button>
            )}
          </div>
          {hasTx ? (
            <div className="space-y-1">
              {txList.slice(0, 5).map(tx => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base flex-shrink-0">
                      {tx.emoji || '💸'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.merchant}</p>
                      <p className="text-xs text-slate-400">{tx.category} · {tx.date}</p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl mb-3">
                💸
              </div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">No transactions yet</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
                Add your first expense or income to start tracking your finances in real time.
              </p>
              <button
                onClick={() => onNav('add-expense')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm"
              >
                <Plus size={14} />
                Add Your First Transaction
              </button>
            </div>
          )}
        </div>

        {/* Goals Progress Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Financial Goals</h3>
              <button
                onClick={() => onNav('goals')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
              >
                {goalsList.length > 0 ? 'View Goals' : '+ Add Goal'}
              </button>
            </div>
            {goalsList.length > 0 ? (
              <div className="space-y-4">
                {goalsList.slice(0, 3).map(goal => (
                  <div key={goal.id}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <span>{goal.emoji || '🎯'}</span>
                        {goal.name}
                      </span>
                      <span className="text-slate-900 dark:text-white font-semibold">
                        ₹{goal.savedAmount.toLocaleString('en-IN')} / ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${goal.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Target size={28} className="text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No financial goals set</p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Create custom goals to track your progress.</p>
                <button
                  onClick={() => onNav('goals')}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  + Create Goal
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNav('financial-health')}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Heart size={14} className="text-rose-500" />
            Check Health Score Breakdown
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Expense', icon: Plus, style: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/25', page: 'add-expense' as Page },
            { label: 'Scan Receipt (OCR)', icon: Scan, style: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30', page: 'ocr' as Page },
            { label: 'Ask AI Copilot', icon: Sparkles, style: 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/30', page: 'chat' as Page },
            { label: 'Time Machine', icon: TrendingUp, style: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30', page: 'timemachine' as Page },
          ].map(action => (
            <button
              key={action.label}
              onClick={() => onNav(action.page)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${action.style}`}
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
