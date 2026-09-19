import { useState, useEffect } from 'react'
import { Plus, X, ArrowUpRight, Sparkles, CheckCircle } from 'lucide-react'
import juniorStore, { JuniorData, WishlistItem } from '../../services/juniorStore'

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
  const [data, setData] = useState<JuniorData>(juniorStore.getData())
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ name: '', emoji: '🎯', target: '' })
  
  // Deposit modal
  const [selectedGoal, setSelectedGoal] = useState<WishlistItem | null>(null)
  const [depositAmount, setDepositAmount] = useState('50')

  useEffect(() => {
    const unsub = juniorStore.subscribe(() => {
      setData(juniorStore.getData())
    })
    return unsub
  }, [])

  const addGoal = () => {
    if (!newGoal.name.trim() || !newGoal.target) return
    const targetVal = Number(newGoal.target)
    if (targetVal <= 0) return

    juniorStore.addWishlistItem(newGoal.name.trim(), targetVal, newGoal.emoji)
    setNewGoal({ name: '', emoji: '🎯', target: '' })
    setShowAdd(false)
  }

  const handleDeposit = () => {
    if (!selectedGoal) return
    const amt = Number(depositAmount)
    if (amt <= 0) return
    if (amt > data.balances.spend) {
      alert(`You only have ₹${data.balances.spend} in your Spend Jar. Reduce the amount or complete more quests!`)
      return
    }

    juniorStore.saveTowardsGoal(selectedGoal.id, amt)
    setSelectedGoal(null)
    setDepositAmount('50')
  }

  const weeklyAllowance = data.profile.allowanceAmount || 100

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Dream Wishlist 🌟</h1>
          <p className="text-sm text-slate-400 mt-0.5">Save money toward items you want and build your savings habits!</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-4 py-2.5 rounded-2xl transition-colors shadow-sm shadow-sky-500/20"
        >
          <Plus size={15} />
          Add New Wish
        </button>
      </div>

      {/* Available for Savings notice */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💸</span>
          <div>
            <p className="text-xs font-bold text-sky-800">Spend Jar Available: ₹{data.balances.spend.toLocaleString()}</p>
            <p className="text-[11px] text-sky-600">You can transfer pocket money from your Spend Jar directly into your Wishlist goals!</p>
          </div>
        </div>
        <span className="text-xs bg-sky-200 text-sky-800 font-bold px-3 py-1 rounded-full">
          Goal Vault: ₹{data.balances.save.toLocaleString()}
        </span>
      </div>

      {/* Goals grid */}
      {data.wishlist.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-sky-100 text-sky-500 flex items-center justify-center text-3xl mx-auto">
            🌟
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Your Wishlist is Empty</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Add your first dream item (like a bicycle, headset, or book) and save toward it!
            </p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={14} /> Add Your First Wish Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.wishlist.map(goal => {
            const pct = Math.min(Math.round((goal.saved / goal.targetPrice) * 100), 100)
            const remaining = Math.max(0, goal.targetPrice - goal.saved)
            const weeksLeft = Math.ceil(remaining / Math.max(1, weeklyAllowance))
            const done = pct >= 100
            const goalColor = goal.color || '#0EA5E9'

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-3xl border p-5 shadow-sm hover:shadow-md transition-all ${
                  done ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200'
                }`}
              >
                {done && (
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full w-fit">
                    <Sparkles size={13} className="text-emerald-500" /> Goal Reached! Ready to buy!
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <CircleProgress pct={pct} color={goalColor} size={88} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{goal.emoji}</span>
                      <h3 className="font-bold text-slate-900 text-base truncate">{goal.itemName}</h3>
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-xl font-black text-slate-900">₹{goal.saved.toLocaleString()}</span>
                      <span className="text-sm text-slate-400">/ ₹{goal.targetPrice.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: goalColor }}
                      />
                    </div>
                    {!done ? (
                      <p className="text-xs text-slate-400">
                        ₹{remaining.toLocaleString()} more needed · ~{weeksLeft} wks at current pace
                      </p>
                    ) : (
                      <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> 100% Funded in Save Vault
                      </p>
                    )}
                  </div>
                </div>

                {!done && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedGoal(goal)
                        setDepositAmount('50')
                      }}
                      className="flex-1 py-2 text-xs font-bold rounded-xl transition-all text-white flex items-center justify-center gap-1 shadow-sm"
                      style={{ backgroundColor: goalColor }}
                    >
                      <ArrowUpRight size={14} /> Save Toward It
                    </button>
                    <button
                      onClick={() => {
                        setSelectedGoal(goal)
                        setDepositAmount(String(Math.min(data.balances.spend, remaining)))
                      }}
                      className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      Max (₹{Math.min(data.balances.spend, remaining)})
                    </button>
                  </div>
                )}
              </div>
            )
          })}

          {/* Add new card button */}
          <button
            onClick={() => setShowAdd(true)}
            className="bg-white rounded-3xl border-2 border-dashed border-slate-200 hover:border-sky-300 hover:bg-sky-50 transition-all min-h-48 flex flex-col items-center justify-center gap-3 group p-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
              <Plus size={20} className="text-slate-400 group-hover:text-sky-500" />
            </div>
            <p className="text-sm font-semibold text-slate-400 group-hover:text-sky-500">Add New Dream Goal</p>
          </button>
        </div>
      )}

      {/* Save Toward Goal Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedGoal.emoji}</span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Save for {selectedGoal.itemName}</h3>
                  <p className="text-xs text-slate-400">Target: ₹{selectedGoal.targetPrice.toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800">
                Current Spend Balance: <strong>₹{data.balances.spend.toLocaleString()}</strong>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Deposit Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={1}
                    max={data.balances.spend}
                    value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[50, 100, 200, 500].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(String(amt))}
                    disabled={amt > data.balances.spend}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 text-xs font-bold rounded-lg"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedGoal(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs shadow-md shadow-sky-500/20"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add goal modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5 border-b pb-3 border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Add a Dream Goal ✨</h2>
              <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">What do you want?</label>
                <input
                  type="text"
                  placeholder="e.g. New Bicycle 🚲"
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
                    type="number"
                    placeholder="5000"
                    value={newGoal.target}
                    onChange={e => setNewGoal(g => ({ ...g, target: e.target.value }))}
                    className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Pick an emoji</label>
                <div className="flex flex-wrap gap-2">
                  {['🎮', '🚲', '🎧', '📚', '⚽', '🎨', '🎯', '🔬', '🎸', '🛹'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewGoal(g => ({ ...g, emoji: e }))}
                      className={`text-2xl p-1.5 rounded-xl transition-colors ${
                        newGoal.emoji === e ? 'bg-sky-100 ring-2 ring-sky-400' : 'hover:bg-slate-100'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={addGoal}
                className="w-full mt-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-2xl transition-colors text-sm shadow-md shadow-sky-500/20"
              >
                Add This Dream Goal! 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


