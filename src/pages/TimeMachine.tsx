import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, Sliders } from 'lucide-react'

type Horizon = '1Y' | '5Y' | '10Y'

const buildData = (horizon: Horizon, discretionaryLeak: number, returnRate: number) => {
  const periods = horizon === '1Y' ? 12 : horizon === '5Y' ? 60 : 120
  const label = horizon === '1Y' ? (i: number) => `M${i + 1}` : horizon === '5Y' ? (i: number) => `Y${Math.floor(i / 12) + 1}M${(i % 12) + 1}` : (i: number) => `Y${Math.floor(i / 12) + 1}`
  const step = horizon === '10Y' ? 12 : horizon === '5Y' ? 6 : 1
  const points = []
  let neutral = 120000, better = 120000, worse = 120000
  const monthlyIncome = 85000
  const baseExpenses = 52000
  for (let i = 0; i < periods; i += step) {
    const months = i + step
    const savings = (monthlyIncome - baseExpenses) * months
    neutral = 120000 + savings + savings * (0.07 / 12) * months
    better = 120000 + (savings * (1 + discretionaryLeak / 100)) + (savings * (returnRate / 100 / 12) * months)
    worse = 120000 + (savings * 0.82) - (savings * 0.02 * months / 12)
    points.push({
      period: label(i),
      neutral: Math.round(neutral / 1000),
      better: Math.round(better / 1000),
      worse: Math.max(0, Math.round(worse / 1000)),
    })
  }
  return points
}

const behaviouralInsights = [
  { emoji: '📅', label: 'Peak Spend Day', value: 'Friday', desc: '34% of weekly spend happens on Fridays' },
  { emoji: '🛒', label: 'Impulse Triggers', value: 'Food + Apps', desc: 'Dining & subscription spikes mid-month' },
  { emoji: '📈', label: 'Subscription Creep', value: '+₹1,200/yr', desc: '3 unused subscriptions detected' },
  { emoji: '🌙', label: 'Late-Night Spend', value: '₹4,800/mo', desc: 'Orders placed 10pm–2am avg. 22% higher' },
]

export default function TimeMachine() {
  const [horizon, setHorizon] = useState<Horizon>('5Y')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [discretionaryLeak, setDiscretionaryLeak] = useState(15)
  const [returnRate, setReturnRate] = useState(10)

  const data = buildData(horizon, discretionaryLeak, returnRate)

  const last = data[data.length - 1]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
        <p className="font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
            <span className="text-slate-600 capitalize">{p.dataKey}:</span>
            <span className="font-bold text-slate-900">₹{p.value}K</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Time Machine</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Behavioral Trajectory Simulator — see where your habits lead
          </p>
        </div>
        <button
          onClick={() => setDrawerOpen(d => !d)}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl hover:border-slate-300 transition-colors shadow-sm"
        >
          <Sliders size={14} />
          Tune Parameters
        </button>
      </div>

      {/* Horizon tabs + chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Net Worth Trajectory</h2>
            <p className="text-xs text-slate-400 mt-0.5">Rolling 90-day behavioral baseline projected forward</p>
          </div>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {(['1Y', '5Y', '10Y'] as Horizon[]).map(h => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  horizon === h ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 text-xs">
          {[
            { color: '#6366F1', label: 'Current Behavior (Neutral)', key: 'neutral' },
            { color: '#10B981', label: `Improved (−${discretionaryLeak}% discretionary)`, key: 'better' },
            { color: '#EF4444', label: 'Worse (lifestyle inflation)', key: 'worse' },
          ].map(l => (
            <div key={l.key} className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full" style={{ background: l.color, display: 'inline-block' }} />
              <span className="text-slate-500 dark:text-slate-400">{l.label}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={Math.floor(data.length / 6)} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}K`} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="neutral" stroke="#6366F1" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="better" stroke="#10B981" strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="worse" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>

        {/* Outcome summary */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: `Neutral in ${horizon}`, value: `₹${last.neutral}K`, icon: Minus, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-800/40' },
            { label: `Improved in ${horizon}`, value: `₹${last.better}K`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/40' },
            { label: `Worse in ${horizon}`, value: `₹${last.worse}K`, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-800/40' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-xl p-4 flex items-center gap-3`}>
              <s.icon size={18} className={s.color} />
              <div>
                <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Behavioral Pattern Insights */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Behavioral Pattern Analysis</h2>
        <div className="grid grid-cols-4 gap-3">
          {behaviouralInsights.map(b => (
            <div key={b.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <span className="text-2xl block mb-2">{b.emoji}</span>
              <p className="text-xs text-slate-400 mb-0.5">{b.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{b.value}</p>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Tuning Drawer */}
      {drawerOpen && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-5">Parameter Tuning</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Discretionary Cut</label>
                <span className="text-sm font-bold text-emerald-600">{discretionaryLeak}%</span>
              </div>
              <input type="range" min={5} max={40} value={discretionaryLeak} onChange={e => setDiscretionaryLeak(Number(e.target.value))}
                className="w-full accent-emerald-500" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5% (minimal)</span><span>40% (aggressive)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">How much to reduce discretionary spend in the "improved" scenario</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Expected Return Rate</label>
                <span className="text-sm font-bold text-indigo-600">{returnRate}% p.a.</span>
              </div>
              <input type="range" min={4} max={18} value={returnRate} onChange={e => setReturnRate(Number(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>4% (FD)</span><span>18% (equity)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">Annual investment return applied to the "improved" projection</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
