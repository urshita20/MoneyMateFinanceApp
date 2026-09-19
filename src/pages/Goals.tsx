import { useState } from 'react'
import { Plus, Sparkles, Target, Calendar, TrendingUp } from 'lucide-react'
import { goals } from '../data/mockData'

const colorMap: Record<string, { ring: string; fill: string; badge: string; text: string }> = {
  emerald: { ring: '#10B981', fill: '#10B981', badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400', text: 'text-emerald-600' },
  blue: { ring: '#3B82F6', fill: '#3B82F6', badge: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', text: 'text-blue-600' },
  slate: { ring: '#64748B', fill: '#64748B', badge: 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400', text: 'text-slate-600' },
  amber: { ring: '#F59E0B', fill: '#F59E0B', badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400', text: 'text-amber-600' },
}

function CircleProgress({ pct, color }: { pct: number; color: string }) {
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * (pct / 100)} ${c}`}
          strokeDashoffset={c * 0.25}
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

export default function Goals() {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track and achieve your savings targets</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/25"
        >
          <Plus size={14} />
          Add Goal
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Saved', value: '₹3,72,000', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Total Target', value: '₹13,30,000', icon: Target, color: 'text-blue-500' },
          { label: 'Active Goals', value: '4', icon: Calendar, color: 'text-violet-500' },
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

      {/* Goal cards */}
      <div className="grid grid-cols-2 gap-4">
        {goals.map(goal => {
          const pct = (goal.saved / goal.target) * 100
          const remaining = goal.target - goal.saved
          const colors = colorMap[goal.color] || colorMap.emerald

          return (
            <div
              key={goal.name}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-3xl mb-2 block">{goal.emoji}</span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Target: {goal.deadline}</p>
                </div>
                <CircleProgress pct={pct} color={colors.fill} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Target</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(goal.target / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Saved</p>
                  <p className={`text-sm font-bold ${colors.text}`}>₹{(goal.saved / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">₹{(remaining / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: colors.fill }}
                />
              </div>

              {/* AI prediction */}
              <div className={`flex items-center gap-2 text-xs px-3 py-2 rounded-xl ${colors.badge}`}>
                <Sparkles size={11} />
                <span>
                  AI predicts: <strong>{goal.aiDate}</strong> at current rate
                </span>
              </div>

              {/* Monthly contribution needed */}
              <p className="text-xs text-slate-400 mt-2">
                Add ₹{Math.round(remaining / 12).toLocaleString()}/month to meet your target
              </p>
            </div>
          )
        })}
      </div>

      {/* Add Goal form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Create New Goal</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Goal name', placeholder: 'e.g. Home Down Payment' },
              { label: 'Target amount (₹)', placeholder: '500000' },
              { label: 'Current savings (₹)', placeholder: '0' },
              { label: 'Target date', placeholder: '', type: 'date' },
            ].map(field => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{field.label}</label>
                <input
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors">
              Create Goal
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
