import { useState } from 'react'
import { ArrowRight, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const weeklyAllowance = 125
const currentBalance = 420
const weeklyQuest = 50

export default function JuniorBuySim() {
  const [itemName, setItemName] = useState('')
  const [price, setPrice] = useState('')
  const [result, setResult] = useState<null | {
    weeksAllowance: number
    quests: number
    daysPatience: number
    balanceAfter: number
    verdict: 'safe' | 'caution' | 'postpone'
    msg: string
  }>(null)

  const simulate = () => {
    const p = Number(price)
    if (!p || !itemName) return
    const weeksAllowance = Math.ceil(p / weeklyAllowance)
    const quests = Math.ceil(p / weeklyQuest)
    const daysPatience = weeksAllowance * 7
    const balanceAfter = currentBalance - p

    let verdict: 'safe' | 'caution' | 'postpone'
    let msg: string

    if (balanceAfter >= 0 && (p / currentBalance) < 0.4) {
      verdict = 'safe'
      msg = `₹${p} is a reasonable spend. You'll still have ₹${balanceAfter} left after buying.`
    } else if (balanceAfter >= 0) {
      verdict = 'caution'
      msg = `This will use ${Math.round((p / currentBalance) * 100)}% of your spending balance. Consider saving a bit more first!`
    } else {
      verdict = 'postpone'
      msg = `You're ₹${Math.abs(balanceAfter)} short right now. Keep saving — you can buy this in about ${weeksAllowance} weeks!`
    }

    setResult({ weeksAllowance, quests, daysPatience, balanceAfter, verdict, msg })
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
        <p className="text-sm text-slate-400 mt-0.5">Before you spend — find out if it's really worth it!</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-3xl p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-100 text-xs font-medium mb-1">Available to Spend Right Now</p>
            <p className="text-4xl font-black">₹{currentBalance}</p>
          </div>
          <div className="text-right text-xs text-sky-100 space-y-1">
            <div>Weekly allowance: ₹{weeklyAllowance}</div>
            <div>Quest earnings/wk: ₹{weeklyQuest}</div>
          </div>
        </div>
      </div>

      {/* Input card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-slate-900">What do you want to buy?</h2>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Item Name</label>
          <input
            type="text" placeholder="e.g. Lego Star Wars Set 🚀"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Price</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₹</span>
            <input
              type="number" placeholder="1200"
              value={price}
              onChange={e => { setPrice(e.target.value); setResult(null) }}
              className="w-full pl-8 pr-4 py-3 text-sm border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-300 transition-all"
            />
          </div>
        </div>

        <button
          onClick={simulate}
          disabled={!itemName || !price}
          className="w-full flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-2xl transition-colors text-sm"
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

          {/* Fun equivalents */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">What does ₹{price} actually mean? 🤔</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { emoji: '📅', label: 'Weeks of Allowance', value: `${result.weeksAllowance} weeks`, color: 'bg-sky-50 border-sky-200 text-sky-600' },
                { emoji: '📋', label: 'Bedroom Cleaning Quests', value: `${result.quests} quests`, color: 'bg-violet-50 border-violet-200 text-violet-600' },
                { emoji: '⏳', label: 'Days of Patience', value: `${result.daysPatience} days`, color: 'bg-amber-50 border-amber-200 text-amber-600' },
              ].map(f => (
                <div key={f.label} className={`${f.color} border rounded-2xl p-4 text-center`}>
                  <span className="text-2xl block mb-2">{f.emoji}</span>
                  <p className={`text-lg font-black ${f.color.split(' ').pop()}`}>{f.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{f.label}</p>
                </div>
              ))}
            </div>

            {/* Fun prompt */}
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-sm text-slate-600 font-medium">
                {result.verdict === 'postpone'
                  ? `🤔 Do you really want to wait ${result.daysPatience} days of saving for this?`
                  : result.verdict === 'caution'
                  ? `💭 Is "${itemName}" worth ${result.weeksAllowance} week${result.weeksAllowance !== 1 ? 's' : ''} of allowance?`
                  : `🎉 Looks like a good decision! "${itemName}" is within your budget.`
                }
              </p>
            </div>
          </div>

          {/* Balance after */}
          <div className={`rounded-3xl border p-5 ${result.balanceAfter >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Balance after buying</p>
              <p className={`text-xl font-black ${result.balanceAfter >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {result.balanceAfter >= 0 ? '' : '-'}₹{Math.abs(result.balanceAfter)}
              </p>
            </div>
            {result.balanceAfter < 0 && (
              <p className="text-xs text-rose-500 mt-1">You're ₹{Math.abs(result.balanceAfter)} short. Complete {Math.ceil(Math.abs(result.balanceAfter) / weeklyQuest)} more quests to reach your goal!</p>
            )}
          </div>
        </div>
      )}

      {/* Tips */}
      {!result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">💡 Smart Spending Tips</h3>
          <div className="space-y-2">
            {[
              { emoji: '⏳', tip: 'Wait 24 hours before buying anything over ₹500 — if you still want it, then it might be worth it!' },
              { emoji: '🎯', tip: 'Check if you can earn it through quests before spending your savings.' },
              { emoji: '🌱', tip: 'Every ₹100 you save today could grow into more if you invest it.' },
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
