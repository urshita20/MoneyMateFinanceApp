import { useState } from 'react'
import {
  CreditCard, AlertCircle, CheckCircle, TrendingDown, Plus, ArrowRight, Sparkles, Calendar,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const loans = [
  {
    name: 'Home Loan',
    bank: 'HDFC Bank',
    emoji: '🏠',
    original: 5000000,
    remaining: 3820000,
    rate: 8.5,
    emi: 43200,
    dueDate: 'Jul 25',
    tenureLeft: '18 yrs 4 mo',
    status: 'active',
    color: '#3B82F6',
  },
  {
    name: 'Car Loan',
    bank: 'ICICI Bank',
    emoji: '🚗',
    original: 800000,
    remaining: 320000,
    rate: 9.2,
    emi: 14800,
    dueDate: 'Jul 28',
    tenureLeft: '2 yrs 1 mo',
    status: 'active',
    color: '#10B981',
  },
  {
    name: 'Education Loan',
    bank: 'SBI',
    emoji: '🎓',
    original: 600000,
    remaining: 95000,
    rate: 7.8,
    emi: 8400,
    dueDate: 'Jul 22',
    tenureLeft: '11 months',
    status: 'active',
    color: '#F59E0B',
  },
  {
    name: 'Personal Loan',
    bank: 'Axis Bank',
    emoji: '💳',
    original: 200000,
    remaining: 0,
    rate: 14.5,
    emi: 0,
    dueDate: '—',
    tenureLeft: '—',
    status: 'completed',
    color: '#10B981',
  },
]

const emiTimeline = [
  { month: 'Feb', total: 66400 },
  { month: 'Mar', total: 66400 },
  { month: 'Apr', total: 66400 },
  { month: 'May', total: 66400 },
  { month: 'Jun', total: 66400 },
  { month: 'Jul', total: 66400 },
]

const repaymentData = [
  { name: 'Home Loan', paid: 1180000, remaining: 3820000, color: '#3B82F6' },
  { name: 'Car Loan', paid: 480000, remaining: 320000, color: '#10B981' },
  { name: 'Education Loan', paid: 505000, remaining: 95000, color: '#F59E0B' },
]

export default function Loans() {
  const [showAdd, setShowAdd] = useState(false)

  const totalOutstanding = loans.filter(l => l.status === 'active').reduce((a, l) => a + l.remaining, 0)
  const totalEMI = loans.filter(l => l.status === 'active').reduce((a, l) => a + l.emi, 0)
  const nextDue = loans.filter(l => l.status === 'active').sort((a, b) => parseInt(a.dueDate) - parseInt(b.dueDate))[0]

  const pieData = loans.filter(l => l.status === 'active').map(l => ({
    name: l.name, value: l.remaining, color: l.color,
  }))

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Loans Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage and track all your active loans</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/25"
        >
          <Plus size={14} />
          Add Loan
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Total Outstanding',
            value: `₹${(totalOutstanding / 100000).toFixed(1)}L`,
            sub: 'across 3 active loans',
            icon: CreditCard,
            bg: 'bg-rose-500',
            badge: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
            badgeText: 'Active',
          },
          {
            label: 'Monthly EMI',
            value: `₹${totalEMI.toLocaleString()}`,
            sub: '31% of monthly income',
            icon: Calendar,
            bg: 'bg-blue-500',
            badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
            badgeText: 'On track',
          },
          {
            label: 'Next EMI Due',
            value: nextDue?.dueDate,
            sub: `${nextDue?.name} — ₹${nextDue?.emi.toLocaleString()}`,
            icon: AlertCircle,
            bg: 'bg-amber-500',
            badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
            badgeText: 'Upcoming',
          },
          {
            label: 'Loan Health Score',
            value: '78 / 100',
            sub: 'EMI-to-income ratio healthy',
            icon: CheckCircle,
            bg: 'bg-emerald-500',
            badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
            badgeText: 'Healthy',
          },
        ].map(card => (
          <div key={card.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 ${card.bg} rounded-xl flex items-center justify-center shadow-sm`}>
                <card.icon size={18} className="text-white" />
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${card.badge}`}>{card.badgeText}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5">{card.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className="text-xs text-slate-400 mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Repayment progress donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Loan Repayment Progress</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString()}`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {repaymentData.map(loan => {
                const pct = Math.round((loan.paid / (loan.paid + loan.remaining)) * 100)
                return (
                  <div key={loan.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{loan.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: loan.color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Monthly EMI timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly EMI Timeline</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={emiTimeline} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} width={40} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'EMI']} />
              <Bar dataKey="total" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Loan cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Loans</h2>
        {loans.map(loan => {
          const pct = loan.status === 'completed' ? 100 : Math.round(((loan.original - loan.remaining) / loan.original) * 100)
          return (
            <div key={loan.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  {loan.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{loan.name}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          loan.status === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {loan.status === 'completed' ? '✓ Completed' : '● Active'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-400">{loan.bank}</span>
                  </div>

                  <div className="grid grid-cols-5 gap-4 mb-3">
                    {[
                      { label: 'Original', value: `₹${(loan.original / 100000).toFixed(1)}L` },
                      { label: 'Remaining', value: loan.status === 'completed' ? '₹0' : `₹${(loan.remaining / 100000).toFixed(1)}L` },
                      { label: 'Interest Rate', value: `${loan.rate}% p.a.` },
                      { label: 'Monthly EMI', value: loan.status === 'completed' ? '—' : `₹${loan.emi.toLocaleString()}` },
                      { label: 'Next Due', value: loan.dueDate },
                    ].map(f => (
                      <div key={f.label}>
                        <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 dark:text-slate-400">{pct}% repaid</span>
                      <span className="text-slate-400">{loan.tenureLeft} remaining</span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: loan.color }}
                      />
                    </div>
                  </div>
                </div>

                {loan.status === 'active' && (
                  <button className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors mt-1">
                    Pay EMI
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Sparkles size={15} className="text-emerald-400" />
            </div>
            <span className="text-sm font-semibold text-white">AI Loan Insights</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { text: 'Paying ₹2,000 extra on your Car Loan every month can close it 8 months earlier, saving ₹18,400 in interest.', icon: '💡' },
              { text: 'Your EMI-to-income ratio is 31% — within the healthy 40% threshold. Great discipline!', icon: '✅' },
              { text: 'Your Education Loan is 94% repaid. Prioritise clearing it this year to free up ₹8,400/month.', icon: '🎯' },
            ].map((tip, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-2xl block mb-2">{tip.icon}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-3">
        {[
          { label: 'Add Loan', icon: Plus, style: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
          { label: 'Make EMI Payment', icon: CreditCard, style: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800' },
          { label: 'View Payment History', icon: ArrowRight, style: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800' },
        ].map(a => (
          <button key={a.label} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${a.style}`}>
            <a.icon size={14} />
            {a.label}
          </button>
        ))}
      </div>
    </div>
  )
}
