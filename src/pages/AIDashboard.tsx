import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Calendar, DollarSign } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { monthlyData } from '../data/mockData'

const spendingForecast = [
  { week: 'W1', actual: 12400, forecast: null },
  { week: 'W2', actual: 14800, forecast: null },
  { week: 'W3', actual: 11200, forecast: null },
  { week: 'W4', actual: null, forecast: 13600 },
  { week: 'W5', actual: null, forecast: 14200 },
]

const savingsPrediction = [
  { month: 'Aug', predicted: 34200 },
  { month: 'Sep', predicted: 36800 },
  { month: 'Oct', predicted: 35400 },
  { month: 'Nov', predicted: 38200 },
  { month: 'Dec', predicted: 41000 },
]

const categoryInsights = [
  { category: 'Food & Dining', spent: 12400, vsLast: +18, emoji: '🍕', alert: true },
  { category: 'Transport', spent: 4200, vsLast: -5, emoji: '🚗', alert: false },
  { category: 'Shopping', spent: 8900, vsLast: +12, emoji: '🛍️', alert: true },
  { category: 'Entertainment', spent: 3200, vsLast: +7, emoji: '🎬', alert: false },
  { category: 'Health', spent: 1890, vsLast: -15, emoji: '💊', alert: false },
]

const upcomingBills = [
  { name: 'Internet Bill', amount: 1499, due: 'Today', emoji: '📶', urgent: true },
  { name: 'Electricity', amount: 1850, due: 'Jul 20', emoji: '⚡', urgent: true },
  { name: 'Rent', amount: 25000, due: 'Jul 25', emoji: '🏠', urgent: false },
  { name: 'Netflix', amount: 649, due: 'Jul 28', emoji: '🎬', urgent: false },
]

const aiCards = [
  {
    title: 'Spending Forecast',
    value: '₹13,600',
    sub: 'Predicted for next week',
    icon: TrendingUp, color: 'bg-blue-500',
    badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    badgeText: 'AI Forecast',
  },
  {
    title: 'Savings Prediction',
    value: '₹34,200',
    sub: 'Expected savings next month',
    icon: DollarSign, color: 'bg-emerald-500',
    badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    badgeText: 'On track',
  },
  {
    title: 'Budget Status',
    value: '82%',
    sub: 'Budget efficiency this month',
    icon: AlertCircle, color: 'bg-amber-500',
    badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    badgeText: '5/6 on track',
  },
  {
    title: 'Bills This Month',
    value: '₹28,997',
    sub: '₹3,349 due in next 7 days',
    icon: Calendar, color: 'bg-violet-500',
    badge: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    badgeText: '2 urgent',
  },
]

export default function AIDashboard() {
  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">AI Insights</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Finshpere analysis — July 2025 · Updated just now
        </p>
      </div>

      {/* AI Monthly Summary hero */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-48 rounded-full bg-emerald-500/8 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-32 rounded-full bg-blue-500/8 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Sparkles size={16} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Finshpere · Monthly Summary</p>
              <p className="text-xs text-slate-400">July 2025</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <p className="text-base text-slate-200 leading-relaxed mb-3">
                You spent <span className="text-rose-400 font-bold">22% more on dining</span> this month.
                You are likely to <span className="text-emerald-400 font-bold">save ₹34,200</span> next month at your current pace.
                Reducing subscriptions could save you <span className="text-amber-400 font-bold">₹14,000 annually</span>.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['Cut dining ₹2k', 'Cancel 2 subs', 'SIP +₹1,000', 'EMI prepayment?'].map(t => (
                  <span key={t} className="text-xs bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-medium">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Income', value: '₹85K', pos: true },
                { label: 'Expenses', value: '₹52.3K', pos: false },
                { label: 'Saved', value: '₹32.7K', pos: true },
                { label: 'Health', value: '83/100', pos: true },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className={`text-sm font-black ${s.pos ? 'text-emerald-400' : 'text-rose-400'}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {aiCards.map(card => (
          <div key={card.title} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${card.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon size={15} className="text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge}`}>{card.badgeText}</span>
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white mb-0.5">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">{card.title}</p>
            <p className="text-xs text-slate-400">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Spending forecast area chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Spending Forecast</h3>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-slate-800 dark:bg-slate-200 inline-block" />Actual</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-blue-400 inline-block" />Forecast</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={spendingForecast}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} width={40} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${Number(v).toLocaleString()}`, '']} />
              <Area type="monotone" dataKey="actual" stroke="#1e293b" strokeWidth={2} fill="none" />
              <Area type="monotone" dataKey="forecast" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 3" fill="url(#forecastGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Savings prediction */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Savings Prediction (Next 5 Months)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={savingsPrediction} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} width={40} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Predicted savings']} />
              <Bar dataKey="predicted" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category insights + upcoming bills */}
      <div className="grid grid-cols-2 gap-4">
        {/* Category spending insights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Category Insights</h3>
          <div className="space-y-3">
            {categoryInsights.map(c => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{c.category}</span>
                    <span className={`text-xs font-bold flex items-center gap-0.5 ${c.vsLast > 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {c.vsLast > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {c.vsLast > 0 ? '+' : ''}{c.vsLast}% vs last
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.alert ? 'bg-rose-400' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((c.spent / 15000) * 100, 100)}%` }} />
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex-shrink-0 w-14 text-right">
                  ₹{(c.spent / 1000).toFixed(1)}K
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming bills */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Upcoming Bills</h3>
          <div className="space-y-3">
            {upcomingBills.map(bill => (
              <div key={bill.name} className={`flex items-center gap-3 p-3 rounded-xl ${bill.urgent ? 'bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/30' : 'bg-slate-50 dark:bg-slate-800'}`}>
                <span className="text-xl">{bill.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{bill.name}</p>
                  <p className={`text-xs ${bill.urgent ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>Due {bill.due}</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{bill.amount.toLocaleString()}</p>
                {bill.urgent && (
                  <button className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0">Pay</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI tips strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: '🍽️', text: 'You spent 22% more on dining this month. Try cooking 3 days/week to save ₹2,400.', type: 'warning' },
          { icon: '💡', text: 'Reducing streaming subscriptions (3 active) can save you ₹14,000 annually.', type: 'tip' },
          { icon: '📈', text: 'Your savings rate of 38.4% puts you in the top 25% of Finshpere users. Keep it up!', type: 'positive' },
        ].map((tip, i) => (
          <div key={i} className={`rounded-2xl p-5 border ${
            tip.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
            : tip.type === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
            : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
          }`}>
            <span className="text-3xl block mb-3">{tip.icon}</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
