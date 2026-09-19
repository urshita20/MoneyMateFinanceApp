import { useState, useEffect } from 'react'
import { Clock, ArrowRight, Plus, CheckCircle, Shield, Settings } from 'lucide-react'
import juniorStore, { JuniorData } from '../../services/juniorStore'

export default function JuniorDashboard() {
  const [data, setData] = useState<JuniorData>(juniorStore.getData())
  const [showSetupModal, setShowSetupModal] = useState(!juniorStore.getData().hasCompletedSetup)
  const [showAddAllowanceModal, setShowAddAllowanceModal] = useState(false)
  const [allowanceInput, setAllowanceInput] = useState('')

  // Onboarding Form State
  const [setupForm, setSetupForm] = useState({
    childName: '',
    childAge: 10,
    allowanceAmount: 500,
    allowanceFrequency: 'Weekly' as 'Weekly' | 'Monthly' | 'Custom',
    spendStart: 200,
    saveStart: 300,
    giveStart: 50,
    spendPct: 50,
    savePct: 35,
    givePct: 15,
    pin: '',
    confirmPin: '',
  })
  const [setupError, setSetupError] = useState('')

  // Local jar allocation sliders
  const [jarValues, setJarValues] = useState({
    spend: data.jarAllocation.spendPct,
    save: data.jarAllocation.savePct,
    give: data.jarAllocation.givePct,
  })

  useEffect(() => {
    const unsub = juniorStore.subscribe(() => {
      const newData = juniorStore.getData()
      setData(newData)
      setJarValues({
        spend: newData.jarAllocation.spendPct,
        save: newData.jarAllocation.savePct,
        give: newData.jarAllocation.givePct,
      })
      if (!newData.hasCompletedSetup) {
        setShowSetupModal(true)
      }
    })
    return unsub
  }, [])

  const updateJar = (jar: 'spend' | 'save' | 'give', val: number) => {
    const others = Object.entries(jarValues).filter(([k]) => k !== jar) as [string, number][]
    const remaining = 100 - val
    const total = others.reduce((s, [, v]) => s + v, 0)
    if (total === 0) return
    const scaled = Object.fromEntries(others.map(([k, v]) => [k, Math.round((v / total) * remaining)]))
    const updated = { ...jarValues, ...scaled, [jar]: val }
    setJarValues(updated)
  }

  const saveJarSplit = () => {
    juniorStore.updateJarAllocations(jarValues.spend, jarValues.save, jarValues.give)
    alert('Jar split saved successfully!')
  }

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupForm.childName.trim()) {
      setSetupError('Please enter child name')
      return
    }
    if (setupForm.pin.length !== 4 || !/^\d{4}$/.test(setupForm.pin)) {
      setSetupError('Parent PIN must be exactly 4 digits')
      return
    }
    if (setupForm.pin !== setupForm.confirmPin) {
      setSetupError('Parent PINs do not match')
      return
    }

    juniorStore.setupProfile({
      childName: setupForm.childName.trim(),
      childAge: Number(setupForm.childAge),
      allowanceAmount: Number(setupForm.allowanceAmount) || 0,
      allowanceFrequency: setupForm.allowanceFrequency,
      parentPin: setupForm.pin,
      spendStart: Number(setupForm.spendStart) || 0,
      saveStart: Number(setupForm.saveStart) || 0,
      giveStart: Number(setupForm.giveStart) || 0,
      spendPct: setupForm.spendPct,
      savePct: setupForm.savePct,
      givePct: setupForm.givePct,
    })

    setShowSetupModal(false)
    setSetupError('')
  }

  const handleDepositAllowance = () => {
    const amt = Number(allowanceInput) || data.profile.allowanceAmount
    if (amt > 0) {
      juniorStore.depositAllowance(amt)
      setShowAddAllowanceModal(false)
      setAllowanceInput('')
    }
  }

  const totalBalance = data.balances.spend + data.balances.save + data.balances.give
  const jars = [
    { key: 'spend' as const, label: 'Spend', emoji: '💸', desc: 'Everyday pocket money', bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600', fill: 'bg-sky-500' },
    { key: 'save' as const, label: 'Save', emoji: '🏦', desc: 'Reserved for dream goals', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600', fill: 'bg-violet-500' },
    { key: 'give' as const, label: 'Give & Grow', emoji: '🌱', desc: 'Future & sharing', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', fill: 'bg-emerald-500' },
  ]

  const activeWishlistCount = data.wishlist.filter(w => w.saved < w.targetPrice).length
  const pendingQuestsCount = data.quests.filter(q => q.status === 'pending').length
  const earnedBadgesCount = data.badges.filter(b => b.earned).length

  return (
    <div className="max-w-4xl space-y-6">
      {/* Setup / Onboarding Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center gap-3 border-b pb-4 border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl">
                🚀
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Setup MoneyMate Junior</h2>
                <p className="text-xs text-slate-400">Configure your child's profile and parental controls</p>
              </div>
            </div>

            {setupError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
                {setupError}
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Child's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={setupForm.childName}
                    onChange={e => setSetupForm({ ...setupForm, childName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Child's Age *</label>
                  <input
                    type="number"
                    min={4}
                    max={18}
                    required
                    value={setupForm.childAge}
                    onChange={e => setSetupForm({ ...setupForm, childAge: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Allowance Amount (₹)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="500"
                    value={setupForm.allowanceAmount}
                    onChange={e => setSetupForm({ ...setupForm, allowanceAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 mb-1 block">Frequency</label>
                  <select
                    value={setupForm.allowanceFrequency}
                    onChange={e => setSetupForm({ ...setupForm, allowanceFrequency: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="border-t pt-3 border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-2">Initial Starting Balances (₹)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block">Spend Jar</label>
                    <input
                      type="number"
                      min={0}
                      value={setupForm.spendStart}
                      onChange={e => setSetupForm({ ...setupForm, spendStart: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block">Save Jar</label>
                    <input
                      type="number"
                      min={0}
                      value={setupForm.saveStart}
                      onChange={e => setSetupForm({ ...setupForm, saveStart: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400 block">Give & Grow</label>
                    <input
                      type="number"
                      min={0}
                      value={setupForm.giveStart}
                      onChange={e => setSetupForm({ ...setupForm, giveStart: Number(e.target.value) })}
                      className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 border-slate-100">
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                  <Shield size={14} className="text-amber-500" />
                  Create 4-Digit Parent PIN *
                </div>
                <p className="text-[11px] text-slate-400 mb-2">Protects access back to parent account & approval actions</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="Enter 4 digits"
                    value={setupForm.pin}
                    onChange={e => setSetupForm({ ...setupForm, pin: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-center tracking-widest font-bold"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="Confirm 4 digits"
                    value={setupForm.confirmPin}
                    onChange={e => setSetupForm({ ...setupForm, confirmPin: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors text-sm shadow-md shadow-sky-500/20"
              >
                Launch Junior Profile 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Balance hero */}
      <div className="bg-gradient-to-r from-sky-500 to-violet-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sky-100 text-sm font-medium">Available to Spend</p>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">
                {data.profile.childAge < 12 ? 'Junior Explorer' : 'Teen Saver'}
              </span>
            </div>
            <p className="text-5xl font-black">₹<span>{data.balances.spend.toLocaleString()}</span></p>
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-center">
                <p className="text-[11px] text-sky-100 mb-0.5">Total Balance</p>
                <p className="text-base font-bold">₹{totalBalance.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-center">
                <p className="text-[11px] text-sky-100 mb-0.5">In Goals Vault</p>
                <p className="text-base font-bold">₹{data.balances.save.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-3 py-2 text-center">
                <p className="text-[11px] text-sky-100 mb-0.5">Give & Grow</p>
                <p className="text-base font-bold">₹{data.balances.give.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center bg-white/10 border border-white/20 rounded-2xl p-4 text-center">
            <Clock size={22} className="text-amber-300 mb-2" />
            <p className="text-xs text-sky-100 mb-1">Allowance Schedule</p>
            <p className="text-2xl font-black text-amber-300">₹{data.profile.allowanceAmount.toLocaleString()}</p>
            <p className="text-xs text-sky-200 mt-1">{data.profile.allowanceFrequency} allowance</p>
            <button
              onClick={() => setShowAddAllowanceModal(true)}
              className="mt-3 text-xs bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm"
            >
              + Add Allowance Now
            </button>
          </div>
        </div>
      </div>

      {/* Manual Allowance Modal */}
      {showAddAllowanceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Deposit Allowance</h3>
            <p className="text-xs text-slate-400">Add allowance money to be split according to the 3-jar allocation.</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
              <input
                type="number"
                placeholder={String(data.profile.allowanceAmount)}
                value={allowanceInput}
                onChange={e => setAllowanceInput(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddAllowanceModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDepositAllowance}
                className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl text-xs"
              >
                Deposit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Jar allocation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-bold text-slate-900 text-base">My 3 Jars Split</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Decide how your ₹{data.profile.allowanceAmount} allowance is split across your jars
            </p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2.5 py-1 rounded-full">
            Split Ratio
          </span>
        </div>

        <div className="space-y-5">
          {jars.map(jar => {
            const splitAmount = Math.round((jarValues[jar.key] / 100) * data.profile.allowanceAmount)
            const currentBal = data.balances[jar.key]
            return (
              <div key={jar.key} className={`${jar.bg} border ${jar.border} rounded-2xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{jar.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-bold ${jar.text}`}>{jar.label}</p>
                        <span className="text-xs font-semibold text-slate-500">(Balance: ₹{currentBal.toLocaleString()})</span>
                      </div>
                      <p className="text-xs text-slate-400">{jar.desc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-base font-black ${jar.text}`}>₹{splitAmount}</p>
                    <p className="text-xs text-slate-400">{jarValues[jar.key]}% split</p>
                  </div>
                </div>
                <input
                  type="range"
                  min={5}
                  max={90}
                  value={jarValues[jar.key]}
                  onChange={e => updateJar(jar.key, Number(e.target.value))}
                  className="w-full accent-sky-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={saveJarSplit}
          className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-2xl transition-colors text-sm shadow-sm shadow-sky-500/20"
        >
          <CheckCircle size={15} />
          Save Jar Split Percentages
        </button>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-base">Recent Activity</h2>
          <button
            onClick={() => setShowSetupModal(true)}
            className="text-xs text-slate-400 flex items-center gap-1 hover:text-slate-600"
          >
            <Settings size={12} /> Edit Profile Settings
          </button>
        </div>

        {data.activity.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">📜</span>
            No activity recorded yet. Complete a quest or add allowance to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {data.activity.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <span className="text-xl w-9 h-9 flex items-center justify-center bg-white rounded-xl shadow-sm flex-shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.label}</p>
                  <p className="text-[11px] text-slate-400">{item.time}</p>
                </div>
                <p className={`text-sm font-bold flex-shrink-0 ${item.amount > 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {item.amount > 0 ? '+' : ''}₹{Math.abs(item.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-violet-50 border border-violet-200 rounded-3xl p-5 text-center">
          <span className="text-3xl block mb-2">🎯</span>
          <p className="text-2xl font-black text-slate-900">{activeWishlistCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Active Wishlist Goals</p>
          <p className="text-xs text-slate-400 mt-0.5">₹{data.balances.save.toLocaleString()} saved in vault</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center">
          <span className="text-3xl block mb-2">📋</span>
          <p className="text-2xl font-black text-slate-900">{pendingQuestsCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Quests To Do</p>
          <p className="text-xs text-slate-400 mt-0.5">Earn coins & XP</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 text-center">
          <span className="text-3xl block mb-2">🏅</span>
          <p className="text-2xl font-black text-slate-900">{earnedBadgesCount}</p>
          <p className="text-xs font-semibold text-slate-700 mt-0.5">Badges Earned</p>
          <p className="text-xs text-slate-400 mt-0.5">{data.profile.xp} total XP</p>
        </div>
      </div>
    </div>
  )
}

