import { useState } from 'react'
import { Plus, X } from 'lucide-react'

const initialGoals = [
  { id: 1, name: 'New Bicycle', emoji: '🚲', target: 8000, saved: 5200, color: '#0EA5E9' },
  { id: 2, name: 'Gaming Headset', emoji: '🎧', target: 3500, saved: 3150, color: '#8B5CF6' },
  { id: 3, name: 'Football Boots', emoji: '⚽', target: 2000, saved: 800, color: '#10B981' },
  { id: 4, name: 'Science Kit', emoji: '🔬', target: 1500, saved: 300, color: '#F59E0B' },
]

function CircleProgress({ pct, color, size = 96 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={8} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={8} fill="none"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize={12} fontWeight={700} fill="#0f172a">
        {pct}%
      </text>
    </svg>
  )
}

export default function JuniorGoals() {
  const [goals, setGoals] = useState(initialGoals)
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', emoji: '🎯', target: '' })

  const weeklySavings = 125

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) return
    setGoals(g => [...g, {
      id: Date.now(), name: newGoal.name, emoji: newGoal.emoji,
      target: Number(newGoal.target), saved: 0, color: '#0EA5E9',
    }])
    setNewGoal({ name: '', emoji: '🎯', target: '' })
    setShowAdd(false)
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Dream Wishlist 🌟</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track your savings goals and watch your dreams get closer!</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition-colors shadow-sm shadow-sky-500/20"
        >
          <Plus size={15} />
          Add New Dream
        </button>
      </div>

      {/* Goals grid */}
      <div className="grid grid-cols-2 gap-4">
        {goals.map(goal => {
          const pct = Math.min(Math.round((goal.saved / goal.target) * 100), 100)
          const remaining = goal.target - goal.saved
          const weeksLeft = Math.ceil(remaining / weeklySavings)
          const done = pct >= 100
          return (
            <div key={goal.id} className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all ${done ? 'border-emerald-300' : 'border-slate-200'}`}>
              {done && (
                <div className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
                  🎉 Goal Reached!
                </div>
              )}
              <div className="flex items-center gap-4">
                <CircleProgress pct={pct} color={goal.color} size={88} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{goal.emoji}</span>
                    <h3 className="font-bold text-slate-900 text-base">{goal.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-xl font-black text-slate-900">₹{goal.saved.toLocaleString()}</span>
                    <span className="text-sm text-slate-400">/ ₹{goal.target.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: goal.color }}
                    />
                  </div>
                  {!done ? (
                    <p className="text-xs text-slate-400">
                      ₹{remaining.toLocaleString()} more · ~{weeksLeft} weeks at current pace
                    </p>
                  ) : (
                    <p className="text-xs text-emerald-600 font-semibold">Ready to buy! 🚀</p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button
                  className="flex-1 py-2 text-xs font-semibold rounded-xl transition-colors text-white"
                  style={{ backgroundColor: goal.color }}
                >
                  Add ₹50
                </button>
                <button className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  Add Custom
                </button>
              </div>
            </div>
          )
        })}

        {/* Add new card */}
        <button
          onClick={() => setShowAdd(true)}
          className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all min-h-48 flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
            <Plus size={20} className="text-slate-400 group-hover:text-sky-500" />
          </div>
          <p className="text-sm font-semibold text-slate-400 group-hover:text-sky-500">Add New Dream Goal</p>
        </button>
      </div>

      {/* Add goal modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900 text-base">Add a Dream Goal ✨</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">What do you want?</label>
                <input
                  type="text" placeholder="e.g. New Bicycle 🚲"
                  value={newGoal.name}
                  onChange={e => setNewGoal(g => ({ ...g, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">How much does it cost?</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₹</span>
                  <input
                    type="number" placeholder="5000"
                    value={newGoal.target}
                    onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pick an emoji</label>
                <div className="flex flex-wrap gap-2">
                  {['🎮', '🚲', '🎧', '📚', '⚽', '🎨', '🎯', '🔬'].map(e => (
                    <button
                      key={e}
                      onClick={() => setNewGoal(g => ({ ...g, emoji: e }))}
                      className={`text-2xl p-1.5 rounded-xl transition-colors ${newGoal.emoji === e ? 'bg-sky-100 ring-2 ring-sky-400' : 'hover:bg-slate-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={addGoal}
                className="w-full mt-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
              >
                Add This Dream! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
