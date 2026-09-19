import { useState } from 'react'
import { Plus, CheckCircle, AlertCircle, Clock, Calendar } from 'lucide-react'
import { bills } from '../data/mockData'

const statusConfig = {
  paid: { label: 'Paid', class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40', dot: 'bg-emerald-500' },
  upcoming: { label: 'Upcoming', class: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
  'due-soon': { label: 'Due Soon', class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/40', dot: 'bg-amber-500' },
  'due-today': { label: 'Due Today', class: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/40', dot: 'bg-rose-500' },
}

const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1)
const billsByDay: Record<number, { name: string; amount: number; status: string }[]> = {
  19: [{ name: 'Internet', amount: 1499, status: 'due-today' }],
  20: [{ name: 'Electricity', amount: 1850, status: 'due-soon' }],
  25: [{ name: 'Rent', amount: 25000, status: 'upcoming' }],
  28: [{ name: 'Netflix', amount: 649, status: 'upcoming' }],
}

export default function Bills() {
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list')
  const today = 19

  const totalDue = bills
    .filter(b => b.status !== 'paid')
    .reduce((a, b) => a + b.amount, 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bills & Reminders</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Stay on top of all your recurring payments</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/25">
          <Plus size={14} />
          Add Bill
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Due This Month', value: `₹${totalDue.toLocaleString()}`, color: 'text-rose-500', icon: AlertCircle },
          { label: 'Bills Paid', value: '₹18,500', color: 'text-emerald-500', icon: CheckCircle },
          { label: 'Upcoming (7 days)', value: '₹3,349', color: 'text-amber-500', icon: Clock },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
            <stat.icon size={20} className={stat.color} />
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['list', 'calendar'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab === 'calendar' ? 'Calendar View' : 'List View'}
          </button>
        ))}
      </div>

      {activeTab === 'list' ? (
        <div className="space-y-3">
          {/* Due today first */}
          {['due-today', 'due-soon', 'upcoming', 'paid'].map(status => {
            const filtered = bills.filter(b => b.status === status)
            if (!filtered.length) return null
            const cfg = statusConfig[status as keyof typeof statusConfig]
            return (
              <div key={status}>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </p>
                <div className="space-y-2">
                  {filtered.map(bill => (
                    <div
                      key={bill.name}
                      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 px-5 py-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-all"
                    >
                      <span className="text-2xl flex-shrink-0">{bill.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{bill.name}</p>
                          {bill.recurring && (
                            <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded-full">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">Due {bill.due}</p>
                      </div>
                      <p className="text-base font-bold text-slate-900 dark:text-white flex-shrink-0">
                        ₹{bill.amount.toLocaleString()}
                      </p>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.class}`}>
                        {cfg.label}
                      </span>
                      {bill.status !== 'paid' && (
                        <button className="flex-shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
                          Pay Now
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">July 2025</h3>
            <div className="flex gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full" />Due today</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full" />Due soon</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-300 rounded-full" />Upcoming</span>
            </div>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
            ))}
          </div>
          {/* Calendar grid — July 2025 starts on Tuesday */}
          <div className="grid grid-cols-7 gap-1">
            {/* 2 empty cells for Mon/Tue start */}
            {[0, 1].map(i => <div key={`empty-${i}`} />)}
            {calendarDays.map(day => {
              const dayBills = billsByDay[day] || []
              const isToday = day === today
              return (
                <div
                  key={day}
                  className={`min-h-[60px] rounded-xl p-1.5 border transition-all ${
                    isToday
                      ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                      : dayBills.length
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50'
                      : 'border-transparent'
                  }`}
                >
                  <p
                    className={`text-xs font-medium mb-1 text-center ${
                      isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day}
                  </p>
                  {dayBills.map(b => (
                    <div
                      key={b.name}
                      className={`text-xs px-1 py-0.5 rounded text-center truncate font-medium ${
                        b.status === 'due-today'
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          : b.status === 'due-soon'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {b.name}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
