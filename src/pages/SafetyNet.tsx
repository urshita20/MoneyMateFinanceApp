import { useState } from 'react'
import { AlertTriangle, Shield, ChevronDown, ChevronUp, Zap } from 'lucide-react'

const liquidAssets = [
  { label: 'Savings Account', amount: 120000, type: 'liquid' },
  { label: 'Short-term FD (breakable)', amount: 80000, type: 'liquid' },
  { label: 'Liquid Mutual Fund', amount: 45000, type: 'liquid' },
]

const monthlyEssentials = [
  { label: 'Rent', amount: 25000, icon: '🏠' },
  { label: 'Groceries & Food', amount: 8000, icon: '🥗' },
  { label: 'Medical Insurance', amount: 3500, icon: '💊' },
  { label: 'EMI (Home Loan)', amount: 12000, icon: '🏦' },
  { label: 'Utilities (Power/Water)', amount: 2500, icon: '⚡' },
]

const liquidTotal = liquidAssets.reduce((s, a) => s + a.amount, 0)
const essentialsTotal = monthlyEssentials.reduce((s, e) => s + e.amount, 0)
const survivalMonths = Math.floor(liquidTotal / essentialsTotal)

const waterfall = [
  { step: 1, label: 'Liquid Savings', desc: 'Savings account balance — zero-friction access', amount: 120000, color: 'emerald' },
  { step: 2, label: 'Break Short-term FD', desc: 'Penalty ~1% — minimal cost for urgent liquidity', amount: 80000, color: 'sky' },
  { step: 3, label: 'Redeem Liquid Mutual Fund', desc: 'T+1 settlement — typically within 1 business day', amount: 45000, color: 'indigo' },
  { step: 4, label: 'Cut Discretionary Subscriptions', desc: 'Cancel streaming, gym, and non-essential apps immediately', amount: 3500, color: 'amber' },
  { step: 5, label: 'Secondary Assets (Gold/ETF)', desc: 'Sell partially if runway extends below 2 months', amount: 55000, color: 'rose' },
]

const nonEssentialCats = ['Dining Out', 'Streaming', 'Shopping', 'Entertainment', 'Gym']

export default function SafetyNet() {
  const [crisisMode, setCrisisMode] = useState(false)
  const [jobLoss, setJobLoss] = useState(false)
  const [medicalBill, setMedicalBill] = useState(false)
  const [medAmount, setMedAmount] = useState(50000)
  const [expanded, setExpanded] = useState<number | null>(null)

  const adjustedLiquid = liquidTotal - (medicalBill ? medAmount : 0)
  const inflow = jobLoss ? 0 : 85000
  const adjustedRunway = inflow > 0
    ? '∞ (income positive)'
    : Math.max(0, Math.floor(adjustedLiquid / essentialsTotal)) + ' months'

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Safety Net & Contingency</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Emergency survival runway and crisis simulation</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${
          survivalMonths >= 6 ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-400'
            : survivalMonths >= 3 ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-400'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/20 dark:border-rose-800/40 dark:text-rose-400'
        }`}>
          <Shield size={14} />
          {survivalMonths >= 6 ? 'Well Protected' : survivalMonths >= 3 ? 'Moderate Risk' : 'Critical — Act Now'}
        </div>
      </div>

      {/* Survival Runway hero */}
      <div className={`rounded-2xl p-6 relative overflow-hidden text-white ${
        crisisMode ? 'bg-gradient-to-r from-rose-600 to-rose-800' : 'bg-gradient-to-r from-slate-800 to-slate-900'
      }`}>
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-1/3 w-64 h-32 rounded-full blur-3xl ${crisisMode ? 'bg-rose-400/20' : 'bg-emerald-500/8'}`} />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-slate-300 text-sm font-medium mb-1">
              {crisisMode ? '⚠️ SURVIVAL BUDGET MODE ACTIVE' : 'Liquid Survival Runway'}
            </p>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-6xl font-black text-white">{crisisMode ? adjustedRunway : `${survivalMonths}M`}</span>
              {!crisisMode && <span className="text-slate-400 text-base">months of runway</span>}
            </div>
            <p className="text-slate-300 text-sm">
              ₹{liquidTotal.toLocaleString()} liquid ÷ ₹{essentialsTotal.toLocaleString()}/mo non-negotiables
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Liquid Assets', val: `₹${(liquidTotal / 1000).toFixed(0)}K` },
              { label: 'Monthly Essentials', val: `₹${(essentialsTotal / 1000).toFixed(0)}K` },
              { label: 'Buffer Target (6M)', val: `₹${((essentialsTotal * 6) / 1000).toFixed(0)}K` },
              { label: 'Gap to Target', val: `₹${Math.max(0, (essentialsTotal * 6 - liquidTotal) / 1000).toFixed(0)}K` },
            ].map(s => (
              <div key={s.label} className="bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-center">
                <p className="text-sm font-black text-white">{s.val}</p>
                <p className="text-xs text-slate-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crisis Simulator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Crisis Simulator</h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <button
            onClick={() => setJobLoss(j => !j)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              jobLoss ? 'border-rose-400 bg-rose-50 dark:bg-rose-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-rose-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💼</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                jobLoss ? 'bg-rose-500 border-rose-500' : 'border-slate-300'
              }`}>
                {jobLoss && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </div>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Sudden Job Loss</p>
            <p className="text-xs text-slate-400 mt-0.5">Zero income scenario — essentials only</p>
          </button>

          <div className={`p-4 rounded-xl border-2 transition-all ${
            medicalBill ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🏥</span>
              <button
                onClick={() => setMedicalBill(m => !m)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                  medicalBill ? 'bg-amber-500 border-amber-500' : 'border-slate-300'
                }`}
              >
                {medicalBill && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Emergency Medical Bill</p>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">₹</span>
              <input
                type="number"
                value={medAmount}
                onChange={e => setMedAmount(Number(e.target.value))}
                onClick={() => setMedicalBill(true)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
        </div>

        {(jobLoss || medicalBill) && (
          <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400 font-semibold text-sm mb-1">
              <AlertTriangle size={14} />
              Simulated Runway: {adjustedRunway}
            </div>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              Liquid reserves: ₹{Math.max(0, adjustedLiquid).toLocaleString()} — {jobLoss ? 'zero income' : 'income intact'} scenario
            </p>
          </div>
        )}

        <button
          onClick={() => setCrisisMode(m => !m)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
            crisisMode
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              : 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20'
          }`}
        >
          <Zap size={15} />
          {crisisMode ? 'Deactivate Survival Budget Mode' : 'Activate Survival Budget Mode'}
        </button>

        {crisisMode && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/40 rounded-xl">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-2">Non-essential categories — PAUSED:</p>
            <div className="flex flex-wrap gap-2">
              {nonEssentialCats.map(c => (
                <span key={c} className="text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40 px-2.5 py-1 rounded-full line-through">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Waterfall Liquidation Plan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Waterfall Liquidation Priority Plan</h2>
        <div className="space-y-2">
          {waterfall.map((item, idx) => (
            <div key={item.step}>
              <button
                onClick={() => setExpanded(expanded === idx ? null : idx)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  item.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
                    : item.color === 'sky' ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40'
                    : item.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/40'
                    : item.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
                    : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 ${
                  item.color === 'emerald' ? 'bg-emerald-500' : item.color === 'sky' ? 'bg-sky-500'
                    : item.color === 'indigo' ? 'bg-indigo-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                }`}>
                  {item.step}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  {expanded === idx && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">₹{item.amount.toLocaleString()}</span>
                {expanded === idx ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly essentials breakdown */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Non-Negotiable Monthly Expenses</h2>
        <div className="space-y-2">
          {monthlyEssentials.map(e => (
            <div key={e.label} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{e.icon}</span>
                <span className="text-sm text-slate-700 dark:text-slate-300">{e.label}</span>
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">₹{e.amount.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
            <span className="text-sm font-bold">Total Monthly Essentials</span>
            <span className="text-sm font-black">₹{essentialsTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
