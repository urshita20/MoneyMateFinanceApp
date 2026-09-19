import { useState, useEffect } from 'react'
import { ArrowRight, AlertTriangle, CheckCircle, Clock, ShoppingBag, Shield, X, Sparkles } from 'lucide-react'
import juniorStore, { JuniorData, WishlistItem } from '../../services/juniorStore'

export default function JuniorBuySim() {
  const [data, setData] = useState<JuniorData>(juniorStore.getData())
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')

  // Purchase confirmation state
  const [showPurchasePinModal, setShowPurchasePinModal] = useState(false)
  const [parentPinInput, setParentPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  const [result, setResult] = useState<null | {
    weeksAllowance: number
    quests: number
    daysPatience: number
    balanceAfter: number
    verdict: 'safe' | 'caution' | 'postpone'
    msg: string
    matchedGoal?: WishlistItem
    impactedGoal?: WishlistItem
  }>(null)

  useEffect(() => {
    const unsub = juniorStore.subscribe(() => {
      setData(juniorStore.getData())
    })
    return unsub
  }, [])

  const currentBalance = data.balances.spend
  const weeklyAllowance = data.profile.allowanceAmount || 100
  const avgQuestReward = 50

  const simulate = () => {
    const p = Number(price)
    if (!p || p <= 0 || !itemName.trim()) return

    const weeksAllowance = Math.max(1, Math.ceil(p / Math.max(1, weeklyAllowance)))
    const quests = Math.max(1, Math.ceil(p / avgQuestReward))
    const daysPatience = weeksAllowance * 7
    const balanceAfter = currentBalance - p

    // Wishlist check
    const matchedGoal = data.wishlist.find(w => w.itemName.toLowerCase().includes(itemName.toLowerCase()) || itemName.toLowerCase().includes(w.itemName.toLowerCase()))
    const impactedGoal = data.wishlist.find(w => w.saved < w.targetPrice)

    let verdict: 'safe' | 'caution' | 'postpone'
    let msg: string

    if (balanceAfter >= 0 && (p / (currentBalance || 1)) < 0.4) {
      verdict = 'safe'
      msg = `₹${p} is a reasonable spend. You'll still have ₹${balanceAfter} left in your Spend Jar after buying.`
    } else if (balanceAfter >= 0) {
      verdict = 'caution'
      msg = `This will use ${Math.round((p / currentBalance) * 100)}% of your available pocket money. Consider saving a bit more first!`
    } else {
      verdict = 'postpone'
      msg = `You're ₹${Math.abs(balanceAfter)} short right now. Keep saving — you can buy this in about ${weeksAllowance} week(s)!`
    }

    setResult({ weeksAllowance, quests, daysPatience, balanceAfter, verdict, msg, matchedGoal, impactedGoal })
  }

  const handleConfirmPurchase = () => {
    const p = Number(price)
    if (!p || p > currentBalance) {
      alert(`Insufficient funds in Spend Jar. You only have ₹${currentBalance}.`)
      return
    }

    // Require Parent PIN for purchases > ₹500
    if (p > 500) {
      setShowPurchasePinModal(true)
      setParentPinInput('')
      setPinError('')
    } else {
      executePurchase()
    }
  }

  const executePurchase = () => {
    const p = Number(price)
    juniorStore.recordPurchase(itemName.trim() || 'Simulated Item', p)
    alert(`Purchase confirmed! Spent ₹${p} from your Spend Jar.`)
    setShowPurchasePinModal(false)
    setItemName('')
    setPrice('')
    setResult(null)
  }

  const handlePinVerifyAndPurchase = () => {
    if (juniorStore.verifyParentPin(parentPinInput)) {
      executePurchase()
    } else {
      setPinError('Incorrect Parent PIN. Try again.')
    }
  }

  const verdictConfig = {
    safe: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-300', label: '✅ Safe to Buy!' },
    caution: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-300', label: '⚠️ Proceed with Caution' },
    postpone: { icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-300', label: '⏳ Recommended: Save More First' },
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Buy Simulator 🛒</h1>
        <p className="text-sm text-slate-400 mt-0.5">Test items before buying to see their impact on your money & goals!</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-3xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-100 text-xs font-medium mb-1">Available to Spend Right Now</p>
            <p className="text-4xl font-black">₹{currentBalance.toLocaleString()}</p>
          </div>
          <div className="text-right text-xs text-sky-100 space-y-1">
            <div>Allowance: ₹{weeklyAllowance}/{data.profile.allowanceFrequency.toLowerCase()}</div>
            <div>Save Vault: ₹{data.balances.save.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Input card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900">What do you want to buy?</h2>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Name</label>
          <input
            type="text"
            placeholder="e.g. Wireless Headphones 🎧"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Price (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              placeholder="1200"
              value={price}
              onChange={e => { setPrice(e.target.value); setResult(null) }}
              className="w-full pl-8 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
            />
          </div>
        </div>

        <button
          onClick={simulate}
          disabled={!itemName || !price}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold py-3 rounded-2xl transition-colors text-sm shadow-sm shadow-sky-500/20"
        >
          Simulate the Purchase <ArrowRight size={15} />
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          {/* Verdict */}
          <div className={`${verdictConfig[result.verdict].bg} border rounded-3xl p-5`}>
            <p className={`text-base font-bold mb-1 ${verdictConfig[result.verdict].color}`}>
              {verdictConfig[result.verdict].label}
            </p>
            <p className="text-sm text-slate-700">{result.msg}</p>
          </div>

          {/* Wishlist match or impact */}
          {result.matchedGoal && (
            <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{result.matchedGoal.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-violet-900">Wishlist Item Found: {result.matchedGoal.itemName}</p>
                  <p className="text-[11px] text-violet-700">
                    Saved: ₹{result.matchedGoal.saved} / Target: ₹{result.matchedGoal.targetPrice}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold bg-violet-200 text-violet-800 px-3 py-1 rounded-full">
                {Math.round((result.matchedGoal.saved / result.matchedGoal.targetPrice) * 100)}% Saved
              </span>
            </div>
          )}

          {result.impactedGoal && !result.matchedGoal && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Sparkles size={14} className="text-amber-500" />
                Opportunity Cost Warning vs Dream Goal ({result.impactedGoal.itemName})
              </div>
              <p className="text-[11px] text-amber-800">
                If you buy this item for <strong>₹{price}</strong>, you will have less pocket money available to transfer to your goal <strong>{result.impactedGoal.itemName}</strong> (which needs ₹{result.impactedGoal.targetPrice - result.impactedGoal.saved} more).
              </p>
            </div>
          )}

          {/* Fun equivalents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">What does ₹{price} actually mean? 🤔</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '📅', label: 'Allowance Work', value: `${result.weeksAllowance} week(s)`, color: 'bg-sky-50 border-sky-200 text-sky-600' },
                { emoji: '📋', label: 'Cleaning Quests', value: `${result.quests} quest(s)`, color: 'bg-violet-50 border-violet-200 text-violet-600' },
                { emoji: '⏳', label: 'Days of Saving', value: `${result.daysPatience} days`, color: 'bg-amber-50 border-amber-200 text-amber-600' },
              ].map(f => (
                <div key={f.label} className={`${f.color} border rounded-2xl p-4 text-center`}>
                  <span className="text-2xl block mb-2">{f.emoji}</span>
                  <p className={`text-lg font-black ${f.color.split(' ').pop()}`}>{f.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{f.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Balance after */}
          <div className={`rounded-3xl border p-5 ${result.balanceAfter >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Spend Jar balance after buying</p>
              <p className={`text-xl font-black ${result.balanceAfter >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.balanceAfter >= 0 ? '' : '-'}₹{Math.abs(result.balanceAfter).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action button */}
          {result.balanceAfter >= 0 ? (
            <button
              onClick={handleConfirmPurchase}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl transition-colors text-sm shadow-md shadow-emerald-600/20"
            >
              <ShoppingBag size={16} /> Confirm Actual Purchase (Spend ₹{price})
            </button>
          ) : (
            <div className="p-3 bg-rose-100 text-rose-800 rounded-2xl text-xs font-semibold text-center">
              Cannot purchase yet. Complete more quests or wait for allowance to increase your Spend Jar balance!
            </div>
          )}
        </div>
      )}

      {/* Parent PIN Modal for Purchases over ₹500 */}
      {showPurchasePinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="text-amber-500" size={18} />
                <h3 className="font-bold text-slate-900 text-sm">Parent Approval Required</h3>
              </div>
              <button onClick={() => setShowPurchasePinModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Purchases over ₹500 require parent PIN verification. (Item: <strong>{itemName}</strong> for <strong>₹{price}</strong>)
            </p>

            {pinError && (
              <p className="text-xs font-semibold text-rose-600">{pinError}</p>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Enter Parent 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="• • • •"
                value={parentPinInput}
                onChange={e => setParentPinInput(e.target.value)}
                className="w-full px-3 py-2 text-base text-center tracking-widest font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowPurchasePinModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handlePinVerifyAndPurchase}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Approve Purchase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">💡 Smart Spending Rules</h3>
          <div className="space-y-2">
            {[
              { emoji: '⏳', tip: 'Wait 24 hours before buying non-essential items over ₹500 to prevent impulse spending!' },
              { emoji: '🎯', tip: 'Check if this purchase delays your Wishlist dream goals.' },
              { emoji: '🌱', tip: 'Money saved in your Save Vault earns interest and grows faster!' },
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                <span className="flex-shrink-0 text-base">{t.emoji}</span>
                {t.tip}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

