import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Heart, Plus, Scan, Sparkles, ArrowRight } from 'lucide-react'
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
import { spendingByCategory as defaultCategoryData, monthlyData as defaultMonthlyData, weeklyTrend as defaultWeeklyTrend, transactions as defaultTransactions } from '../data/mockData'
import { api } from '../services/api'
import type { Page } from '../types'

interface DashboardProps {
  onNav: (p: Page) => void
  user?: any
}

export default function Dashboard({ onNav, user }: DashboardProps) {
  const [summary, setSummary] = useState<any>(null)
  const [categories, setCategories] = useState(defaultCategoryData)
  const [monthlyTrends, setMonthlyTrends] = useState(defaultMonthlyData)
  const [weeklyTrends, setWeeklyTrends] = useState(defaultWeeklyTrend)
  const [txList, setTxList] = useState(defaultTransactions)

  useEffect(() => {
    // Fetch live dashboard analytics from Render backend
    api.analytics.getSummary().then(res => {
      if (res.success && res.summary) setSummary(res.summary)
    }).catch(console.error)

    api.analytics.getSpendingByCategory().then(res => {
      if (res.success && res.categories) setCategories(res.categories)
    }).catch(console.error)

    api.analytics.getMonthlyTrends().then(res => {
      if (res.success && res.monthlyData) setMonthlyTrends(res.monthlyData)
    }).catch(console.error)

    api.transactions.getAll().then(res => {
      if (res.success && res.transactions) setTxList(res.transactions)
    }).catch(console.error)
  }, [])

  const statCardsData = [
    { title: 'Total Balance', value: summary ? `₹${summary.netWorth.toLocaleString()}` : '₹1,24,500', change: '+8.2%', icon: Wallet, bg: 'bg-emerald-500', positive: true },
    { title: 'Monthly Income', value: summary ? `₹${summary.monthlyIncome.toLocaleString()}` : '₹85,000', change: 'Stable', icon: TrendingUp, bg: 'bg-blue-500', positive: true },
    { title: 'Monthly Expenses', value: summary ? `₹${summary.monthlyExpense.toLocaleString()}` : '₹52,340', change: '+4.1%', icon: TrendingDown, bg: 'bg-rose-400', positive: false },
    { title: 'Savings', value: summary ? `₹${(summary.monthlyIncome - summary.monthlyExpense).toLocaleString()}` : '₹32,660', change: '+12%', icon: PiggyBank, bg: 'bg-violet-500', positive: true },
    { title: 'Health Score', value: summary ? `${summary.healthScore} / 100` : '74 / 100', change: 'Good', icon: Heart, bg: 'bg-amber-500', positive: true },
  ]

  const userName = user?.name || 'Alex Johnson'

  return (
    <div className="space-y-6 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Good morning, {userName} 👋</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Here's your financial overview for July 2025</p>
        </div>
        <span className="text-sm text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
          July 19, 2025
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4">
        {statCardsData.map(card => (
          <div
            key={card.title}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon size={16} className="text-white" />
              </div>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  card.positive
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400'
                }`}
              >
                {card.change}
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4">
        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Spending by Category</h3>
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
        </div>

        {/* Bar chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Income vs Expenses</h3>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Income</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Expenses</span>
            </div>
          </div>
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
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={v => [`₹${Number(v).toLocaleString()}`, '']}
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#FB7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Spending Trend (This Week)</h3>
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
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={v => [`₹${Number(v).toLocaleString()}`, 'Spent']}
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
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Transactions table */}
        <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Transactions</h3>
            <button
              onClick={() => onNav('transactions')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="space-y-1">
            {txList.slice(0, 6).map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-base flex-shrink-0">
                    {tx.emoji}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{tx.merchant}</p>
                    <p className="text-xs text-slate-400">{tx.category} · {tx.date}</p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    tx.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right widgets */}
        <div className="space-y-4">
          {/* Upcoming bills */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Upcoming Bills</h3>
              <button
                onClick={() => onNav('bills')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
              >
                See all
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Internet', amount: 1499, due: 'Today', urgent: true, emoji: '📶' },
                { name: 'Electricity', amount: 1850, due: 'Jul 20', urgent: true, emoji: '⚡' },
                { name: 'Rent', amount: 25000, due: 'Jul 25', urgent: false, emoji: '🏠' },
              ].map(bill => (
                <div key={bill.name} className="flex items-center gap-3">
                  <span className="text-base">{bill.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{bill.name}</p>
                    <p className={`text-xs ${bill.urgent ? 'text-rose-500' : 'text-slate-400'}`}>Due {bill.due}</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    ₹{bill.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Goals Progress</h3>
              <button
                onClick={() => onNav('goals')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-medium"
              >
                See all
              </button>
            </div>
            <div className="space-y-3">
              {[
                { name: 'Emergency Fund', progress: 48, color: 'bg-emerald-500' },
                { name: 'Goa Vacation', progress: 64, color: 'bg-blue-500' },
                { name: 'MacBook Pro', progress: 42, color: 'bg-violet-500' },
              ].map(goal => (
                <div key={goal.name}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{goal.name}</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{goal.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${goal.color} rounded-full transition-all`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Add Expense', icon: Plus, style: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/25', page: 'add-expense' as Page },
            { label: 'Scan Receipt', icon: Scan, style: 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/30', page: 'ocr' as Page },
            { label: 'Ask AI', icon: Sparkles, style: 'bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/30', page: 'chat' as Page },
            { label: 'View Insights', icon: TrendingUp, style: 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30', page: 'insights' as Page },
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
