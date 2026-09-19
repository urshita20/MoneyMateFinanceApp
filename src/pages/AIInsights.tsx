import { Sparkles, TrendingUp, TrendingDown, Target, Activity, AlertCircle } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { monthlyData, weeklyTrend, spendingByCategory } from '../data/mockData'

const weeklyExpenses = weeklyTrend.map(d => ({ ...d, budget: 3000 }))

const categoryComparison = spendingByCategory.map(c => ({
  name: c.name,
  thisMonth: Math.round(c.value * 520),
  lastMonth: Math.round(c.value * 480 + (Math.random() - 0.5) * 1000),
  color: c.color,
}))

export default function AIInsights() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Powered by Gemini AI — July 2025</p>
      </div>

      {/* AI Summary card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl -translate-y-1/2 translate-x-1/4" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-slate-300">AI Monthly Summary</span>
          </div>
          <p className="text-lg font-semibold text-white mb-3 leading-relaxed">
            You spent <span className="text-rose-400">18% more on dining</span> this month compared to last month. Your
            overall savings rate is <span className="text-emerald-400">38.4%</span> — well above the 20% recommended
            threshold.
          </p>
          <p className="text-sm text-slate-400 leading-relaxed">
            If you reduce weekend dining by ₹2,000 and switch 2 Uber rides per week to metro, you could save an
            additional <strong className="text-white">₹4,800/month</strong>, reaching your Emergency Fund goal 2 months
            earlier.
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Highest Spending',
            value: 'Food & Dining',
            sub: '₹12,400 this month',
            icon: TrendingUp,
            color: 'text-orange-500',
            bg: 'bg-orange-50 dark:bg-orange-900/20',
          },
          {
            label: 'Savings Rate',
            value: '38.4%',
            sub: '+5.2% from last month',
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          },
          {
            label: 'Budget Efficiency',
            value: '82%',
            sub: '5/6 categories on track',
            icon: Activity,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            label: 'Next Month Prediction',
            value: '₹54,200',
            sub: '+3.5% expected rise',
            icon: TrendingDown,
            color: 'text-violet-500',
            bg: 'bg-violet-50 dark:bg-violet-900/20',
          },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className={`w-9 h-9 ${card.bg} rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={16} className={card.color} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{card.label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly expenses vs budget */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Weekly Expenses</h3>
            <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">Daily budget: ₹3,000</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyExpenses} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} width={40} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={v => [`₹${Number(v).toLocaleString()}`, 'Spent']}
              />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {weeklyExpenses.map((entry, i) => (
                  <Cell key={i} fill={entry.amount > entry.budget ? '#FB7185' : '#10B981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trends */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">6-Month Expense Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} width={38} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
                formatter={v => [`₹${Number(v).toLocaleString()}`, '']}
              />
              <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} name="Income" />
              <Line type="monotone" dataKey="expense" stroke="#FB7185" strokeWidth={2} dot={false} name="Expense" strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category comparison */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Category Comparison: This Month vs Last Month</h3>
          <div className="flex gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-800 dark:bg-slate-200 inline-block" />This month</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-300 dark:bg-slate-600 inline-block" />Last month</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryComparison} barSize={14} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} width={45} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={v => [`₹${Number(v).toLocaleString()}`, '']}
            />
            <Bar dataKey="thisMonth" fill="#1e293b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lastMonth" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI tips */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            icon: '💡',
            title: 'Switch to monthly Netflix plan',
            desc: 'You could save ₹1,800/year by switching from monthly to annual Netflix subscription.',
            savings: '₹1,800/yr',
            type: 'tip',
          },
          {
            icon: '⚠️',
            title: 'Entertainment spending flagged',
            desc: 'You spent ₹3,200 on entertainment against a ₹3,000 budget. Consider planning ahead.',
            savings: 'Save ₹200',
            type: 'warning',
          },
          {
            icon: '🎯',
            title: 'Emergency fund on track',
            desc: "At your current savings rate, you'll reach your ₹3 lakh emergency fund by November 2025.",
            savings: 'On track',
            type: 'positive',
          },
          {
            icon: '🚗',
            title: 'High transport expenses',
            desc: 'Transport costs are 40% higher on weekends. Consider carpooling or metro on weekends.',
            savings: 'Save ₹1,200/mo',
            type: 'warning',
          },
        ].map((tip, i) => (
          <div
            key={i}
            className={`rounded-2xl p-5 border ${
              tip.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
                : tip.type === 'positive'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{tip.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{tip.title}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{tip.desc}</p>
                <span
                  className={`inline-block mt-2 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    tip.type === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                      : tip.type === 'positive'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                      : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                  }`}
                >
                  {tip.savings}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
