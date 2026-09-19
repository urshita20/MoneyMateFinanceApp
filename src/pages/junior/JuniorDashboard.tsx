import { useState, useEffect } from 'react'
import { Clock, ArrowRight, Plus, CheckCircle, Shield, Settings } from 'lucide-react'
import juniorStore, { JuniorData } from '../../services/juniorStore'

export default function JuniorDashboard() {
  const [data, setData] = useState<JuniorData>(juniorStore.getData())
  const [showSetupModal, setShowSetupModal] = useState(!juniorStore.getData().hasCompletedSetup)
  const [showAddAllowanceModal, setShowAddAllowanceModal] = useState(false)
  const [allowanceInput, setAllowanceInput] = useState('')
  const [allowancePinInput, setAllowancePinInput] = useState('')
  const [allowancePinError, setAllowancePinError] = useState('')

  // Onboarding Form State
  const [setupForm, setSetupForm] = useState({
    childName: data.profile?.childName || '',
    childAge: data.profile?.childAge || 10,
    allowanceAmount: data.profile?.allowanceAmount || 1000,
    allowanceFrequency: 'Monthly' as 'Weekly' | 'Monthly' | 'Custom',
    spendStart: 500,
    saveStart: 350,
    giveStart: 150,
    spendPct: data.jarAllocation?.spendPct || 50,
    savePct: data.jarAllocation?.savePct || 35,
    givePct: data.jarAllocation?.givePct || 15,
    pin: data.profile?.parentPin || '',
    confirmPin: data.profile?.parentPin || '',
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

  const openSetupModal = () => {
    const current = juniorStore.getData()
    setSetupForm({
      childName: current.profile?.childName || '',
      childAge: current.profile?.childAge || 10,
      allowanceAmount: current.profile?.allowanceAmount || 1000,
      allowanceFrequency: 'Monthly',
      spendStart: current.balances.spend,
      saveStart: current.balances.save,
      giveStart: current.balances.give,
      spendPct: current.jarAllocation.spendPct,
      savePct: current.jarAllocation.savePct,
      givePct: current.jarAllocation.givePct,
      pin: current.profile?.parentPin || '',
      confirmPin: current.profile?.parentPin || '',
    })
    setSetupError('')
    setShowSetupModal(true)
  }

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!setupForm.childName.trim()) {
      setSetupError("Please enter child's name")
      return
    }
    if (!setupForm.childAge || setupForm.childAge < 3 || setupForm.childAge > 18) {
      setSetupError("Please enter a valid age between 3 and 18")
      return
    }
    if (!setupForm.allowanceAmount || setupForm.allowanceAmount <= 0) {
      setSetupError("Please enter a valid monthly budget amount (₹)")
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

    const monthlyBudget = Number(setupForm.allowanceAmount)
    const spendStart = Math.round((setupForm.spendPct / 100) * monthlyBudget)
    const saveStart = Math.round((setupForm.savePct / 100) * monthlyBudget)
    const giveStart = Math.max(0, monthlyBudget - spendStart - saveStart)

    juniorStore.setupProfile({
      childName: setupForm.childName.trim(),
      childAge: Number(setupForm.childAge),
      allowanceAmount: monthlyBudget,
      allowanceFrequency: 'Monthly',
      parentPin: setupForm.pin,
      spendStart,
      saveStart,
      giveStart,
      spendPct: setupForm.spendPct,
      savePct: setupForm.savePct,
      givePct: setupForm.givePct,
    })

    setShowSetupModal(false)
    setSetupError('')
  }

  const handleDepositAllowance = () => {
    setAllowancePinError('')
    if (!allowancePinInput.trim()) {
      setAllowancePinError('Please enter your 4-digit Parent PIN')
      return
    }
    if (!juniorStore.verifyParentPin(allowancePinInput)) {
      setAllowancePinError('Incorrect Parent PIN. Only parent can deposit allowance.')
      return
    }

    const amt = Number(allowanceInput) || data.profile.allowanceAmount
    if (amt > 0) {
      juniorStore.depositAllowance(amt)
      setShowAddAllowanceModal(false)
      setAllowanceInput('')
      setAllowancePinInput('')
      setAllowancePinError('')
    } else {
      setAllowancePinError('Please enter a valid allowance amount.')
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
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Child's Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leo"
                    value={setupForm.childName}
                    onChange={e => setSetupForm({ ...setupForm, childName: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Child's Age *</label>
                  <input
                    type="number"
                    min={3}
                    max={18}
                    required
                    placeholder="e.g. 10"
                    value={setupForm.childAge || ''}
                    onChange={e => setSetupForm({ ...setupForm, childAge: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Monthly Budget / Allowance (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    min={100}
                    required
                    placeholder="e.g. 1000"
                    value={setupForm.allowanceAmount || ''}
                    onChange={e => setSetupForm({ ...setupForm, allowanceAmount: Number(e.target.value) })}
                    className="w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  This monthly budget will be split into 3 jars: 50% Spend (₹{Math.round((setupForm.allowanceAmount || 0) * 0.5)}), 35% Save (₹{Math.round((setupForm.allowanceAmount || 0) * 0.35)}), and 15% Give (₹{Math.round((setupForm.allowanceAmount || 0) * 0.15)}).
                </p>
              </div>

              <div className="border-t pt-3 border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-1">
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
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl text-center tracking-widest font-bold"
                  />
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="Confirm 4 digits"
                    value={setupForm.confirmPin}
                    onChange={e => setSetupForm({ ...setupForm, confirmPin: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-xl text-center tracking-widest font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors text-sm shadow-md shadow-sky-500/20"
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

      {/* Manual Allowance Modal - Requires Parent PIN */}
      {showAddAllowanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-2 border-b pb-3 border-slate-100">
              <Shield size={18} className="text-amber-500" />
              <h3 className="font-bold text-slate-900 text-base">Parent Allowance Deposit</h3>
            </div>
            <p className="text-xs text-slate-500">Only parents can give allowance. Enter allowance amount and your Parent PIN.</p>
            
            {allowancePinError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold rounded-xl">
                {allowancePinError}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Allowance Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  placeholder={String(data.profile.allowanceAmount)}
                  value={allowanceInput}
                  onChange={e => setAllowanceInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Parent 4-Digit PIN *</label>
              <input
                type="password"
                maxLength={4}
                placeholder="• • • •"
                value={allowancePinInput}
                onChange={e => setAllowancePinInput(e.target.value)}
                className="w-full px-3 py-2 text-base text-center tracking-widest font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setShowAddAllowanceModal(false)
                  setAllowancePinError('')
                  setAllowancePinInput('')
                }}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDepositAllowance}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20"
              >
                Deposit Allowance
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
            onClick={openSetupModal}
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

