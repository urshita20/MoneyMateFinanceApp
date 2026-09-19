import { useState } from 'react'
import { Clock, ArrowRight, Plus, TrendingUp } from 'lucide-react'

const recentActivity = [
  { emoji: '✅', label: 'Quest: Clean bedroom', amount: +50, time: '2h ago', type: 'reward' },
  { emoji: '🍦', label: 'Ice cream', amount: -30, time: 'Yesterday', type: 'spend' },
  { emoji: '📚', label: 'Allowance received', amount: +500, time: '3 days ago', type: 'income' },
  { emoji: '🎮', label: 'Gaming coins', amount: -80, time: '4 days ago', type: 'spend' },
]

export default function JuniorDashboard() {
  const [jarValues, setJarValues] = useState({ spend: 50, save: 35, give: 15 })
  const [newAllowance] = useState(500)

  const totalPct = jarValues.spend + jarValues.save + jarValues.give

  const updateJar = (jar: 'spend' | 'save' | 'give', val: number) => {
    const others = Object.entries(jarValues).filter(([k]) => k !== jar) as [string, number][]
    const remaining = 100 - val
    const total = others.reduce((s, [, v]) => s + v, 0)
    if (total === 0) return
    const scaled = Object.fromEntries(others.map(([k, v]) => [k, Math.round((v / total) * remaining)]))
    setJarValues({ ...jarValues, ...scaled, [jar]: val })
  }

  const jars = [
    { key: 'spend' as const, label: 'Spend', emoji: '💸', color: 'sky', desc: 'Pocket money now', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600', fill: 'bg-sky-500', track: 'bg-sky-100' },
    { key: 'save' as const, label: 'Save', emoji: '🏦', color: 'violet', desc: 'Locked for goals', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', fill: 'bg-violet-500', track: 'bg-violet-100' },
    { key: 'give' as const, label: 'Give & Grow', emoji: '🌱', color: 'emerald', desc: 'Share & learn', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: 'bg-emerald-500', track: 'bg-emerald-100' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      {/* Balance hero */}
      <div className="bg-gradient-to-r from-sky-500 to-violet-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <p className="text-sky-100 text-sm font-medium mb-1">Available to Spend</p>
            <p className="text-5xl font-black mb-3">₹<span>420</span></p>
            <div className="flex gap-3">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-sky-100 mb-0.5">Total Balance</p>
                <p className="text-base font-bold">₹1,840</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-sky-100 mb-0.5">In Goals Vault</p>
                <p className="text-base font-bold">₹1,120</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-2 text-center">
                <p className="text-xs text-sky-100 mb-0.5">Give & Grow</p>
                <p className="text-base font-bold">₹300</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
            <Clock size={20} className="text-amber-300 mb-2" />
            <p className="text-xs text-sky-100 mb-1">Next Allowance In</p>
            <p className="text-2xl font-black text-amber-300">3d 14h</p>
            <p className="text-xs text-sky-200 mt-1">₹500 from Dad</p>
          </div>
        </div>
      </div>

      {/* 3-Jar allocation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900 text-base">My 3 Jars</h2>
            <p className="text-xs text-slate-400 mt-0.5">Slide to decide how to split your next ₹{newAllowance} allowance</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
            Incoming ₹500
          </span>
        </div>

        <div className="space-y-5">
          {jars.map(jar => {
            const amount = Math.round((jarValues[jar.key] / 100) * newAllowance)
            return (
              <div key={jar.key} className={`${jar.bg} border ${jar.border} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{jar.emoji}</span>
                    <div>
                      <p className={`text-sm font-bold ${jar.text}`}>{jar.label}</p>
                      <p className="text-xs text-slate-400">{jar.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${jar.text}`}>₹{amount}</p>
                    <p className="text-xs text-slate-400">{jarValues[jar.key]}%</p>
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={jarValues[jar.key]}
                  onChange={e => updateJar(jar.key, Number(e.target.value))}
                  className="w-full accent-sky-500 h-2"
                />
              </div>
            )
          })}
        </div>

        <button className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-2xl transition-colors text-sm shadow-sm shadow-sky-500/20">
          <Plus size={15} />
          Confirm Jar Split & Save
        </button>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-base">Recent Activity</h2>
          <button className="text-xs text-sky-500 font-semibold flex items-center gap-1 hover:underline">
            View all <ArrowRight size={11} />
          </button>
        </div>
        <div className="space-y-3">
          {recentActivity.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
              <span className="text-xl w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm flex-shrink-0">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{item.label}</p>
                <p className="text-xs text-slate-400">{item.time}</p>
              </div>
              <p className={`text-sm font-bold flex-shrink-0 ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: '🎯', label: 'Goals Active', value: '3', sub: '₹1,120 saved', color: 'bg-violet-50 border-violet-200' },
          { emoji: '📋', label: 'Quests Pending', value: '4', sub: '₹280 to earn', color: 'bg-amber-50 border-amber-200' },
          { emoji: '🏅', label: 'Badges Earned', value: '7', sub: '3 new this month', color: 'bg-emerald-50 border-emerald-200' },
        ].map(s => (
          <div key={s.label} className={`${s.color} border rounded-3xl p-5 text-center`}>
            <span className="text-3xl block mb-2">{s.emoji}</span>
            <p className="text-2xl font-black text-slate-900">{s.value}</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{s.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
