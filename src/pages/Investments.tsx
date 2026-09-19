import React, { useState, useEffect } from 'react'
import { Sparkles, ChevronRight, Info, CheckCircle, PieChart, Wallet, ShieldCheck, TrendingUp, Settings } from 'lucide-react'
import { dataStore } from '../services/dataStore'
import type { Page } from '../types'

interface InvestmentsProps {
  onNav?: (p: Page) => void
}

const baseProducts = [
  {
    id: 'emergency',
    emoji: '🛡️', name: 'Emergency Fund Buffer', risk: 'No Risk', returns: '3–4%', horizon: '1–6 months',
    suitedFor: 'Everyone — mandatory first step', tag: 'Priority', tagColor: 'rose',
    desc: 'Keep 3 to 6 months of living expenses in liquid funds or high-yield savings before high-risk investments.',
    allocationRatio: { Conservative: 0.35, Moderate: 0.25, Aggressive: 0.15 },
  },
  {
    id: 'sip',
    emoji: '📈', name: 'Nifty 50 Index SIP', risk: 'Moderate', returns: '12–14%', horizon: '5+ years',
    suitedFor: 'Wealth creation & beginners', tag: 'Recommended', tagColor: 'emerald',
    desc: 'Automated monthly investment tracking top 50 Indian companies. Rupee-cost averaging reduces volatility.',
    allocationRatio: { Conservative: 0.20, Moderate: 0.40, Aggressive: 0.45 },
  },
  {
    id: 'ppf',
    emoji: '🏛️', name: 'Public Provident Fund (PPF)', risk: 'No Risk', returns: '7.1%', horizon: '15 years',
    suitedFor: 'Tax saving (80C) & long term', tag: 'Tax Free', tagColor: 'green',
    desc: 'Government backed tax-free returns under EEE status. Excellent long-term retirement anchor.',
    allocationRatio: { Conservative: 0.25, Moderate: 0.15, Aggressive: 0.10 },
  },
  {
    id: 'mutual_funds',
    emoji: '🧩', name: 'Flexi-Cap Equity Funds', risk: 'Moderate–High', returns: '12–16%', horizon: '3–7 years',
    suitedFor: 'Growth-oriented investors', tag: 'Popular', tagColor: 'violet',
    desc: 'Diversified fund manager allocation across large, mid, and small cap companies for capital growth.',
    allocationRatio: { Conservative: 0.10, Moderate: 0.20, Aggressive: 0.30 },
  },
  {
    id: 'fd',
    emoji: '🏦', name: 'Fixed Deposit (FD)', risk: 'Very Low', returns: '6.5–7.5%', horizon: '1–3 years',
    suitedFor: 'Short term capital safety', tag: 'Guaranteed', tagColor: 'blue',
    desc: 'DICGC insured fixed return for scheduled short-term goals without market exposure.',
    allocationRatio: { Conservative: 0.10, Moderate: 0.0, Aggressive: 0.0 },
  },
]

const tagColors: Record<string, string> = {
  rose:    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  violet:  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  amber:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  green:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
}

const profiles = ['Conservative', 'Moderate', 'Aggressive'] as const
type Risk = typeof profiles[number]

export default function Investments({ onNav }: InvestmentsProps) {
  const [riskProfile, setRiskProfile] = useState<Risk>('Moderate')
  const [summaryData, setSummaryData] = useState<any>(null)

  useEffect(() => {
    const summary = dataStore.getDashboardSummary()
    setSummaryData(summary)
  }, [])

  const profile = dataStore.getProfile()
  const transactions = dataStore.getTransactions()

  const monthlyIncome = profile.monthlyIncome > 0
    ? profile.monthlyIncome
    : transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  
  const monthlyBudget = profile.monthlyBudget || 0
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  // Real capacity calculation from stored income / budget and actual expenses
  const availableSurplus = Math.max(0, (monthlyIncome > 0 ? monthlyIncome : monthlyBudget) - totalExpenses)
  const monthlyInvestCapacity = Math.round(availableSurplus * 0.5) // Recommend 50% of monthly surplus

  const hasBudgetConfigured = monthlyBudget > 0 || monthlyIncome > 0 || transactions.length > 0

  if (!hasBudgetConfigured) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 mb-4 border border-emerald-100 dark:border-emerald-800/40">
            <PieChart size={28} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Set Your Monthly Budget</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-md">
            To generate personalized investment ideas, please configure your monthly budget and income first. We analyze your actual expenses to calculate how much you can safely invest each month.
          </p>
          {onNav && (
            <button
              onClick={() => onNav('budget')}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20"
            >
              <Settings size={16} />
              Set Monthly Budget
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header banner with dynamic numbers */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 relative overflow-hidden text-white shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-100" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">Budget-Calculated Ideas</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Personalised Investment Suggestions</h1>
            <p className="text-emerald-100 text-xs md:text-sm">
              Based on your monthly budget (₹{monthlyBudget.toLocaleString('en-IN')}) and actual recorded expenses (₹{totalExpenses.toLocaleString('en-IN')}).
            </p>
          </div>
          <div className="text-center bg-white/15 border border-white/20 rounded-2xl p-4 flex-shrink-0">
            <p className="text-2xl md:text-3xl font-black">₹{monthlyInvestCapacity.toLocaleString('en-IN')}</p>
            <p className="text-xs text-emerald-100 mt-0.5">Calculated Monthly Capacity</p>
          </div>
        </div>
      </div>

      {/* Risk profile widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Select Risk Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">Adjusts instrument allocations based on your risk comfort level</p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
            Current: {riskProfile}
          </span>
        </div>
        <div className="flex gap-3">
          {profiles.map(p => (
            <button
              key={p}
              onClick={() => setRiskProfile(p)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                riskProfile === p
                  ? p === 'Conservative' ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                    : p === 'Moderate' ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                    : 'bg-rose-500 text-white border-rose-500 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
              }`}
            >
              {p === 'Conservative' ? '🛡️' : p === 'Moderate' ? '⚖️' : '🚀'} {p}
            </button>
          ))}
        </div>
      </div>

      {/* AI Recommendation Box derived from real budget */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 relative overflow-hidden text-white shadow-sm">
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={18} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-bold text-white">MoneyMate AI Budget Recommendation</p>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              With a monthly surplus of <strong className="text-emerald-400">₹{availableSurplus.toLocaleString('en-IN')}</strong>, we recommend putting <strong className="text-white">₹{monthlyInvestCapacity.toLocaleString('en-IN')}</strong> into investments.
              {riskProfile === 'Moderate' && (
                <> Allocate <strong className="text-emerald-400">₹{Math.round(monthlyInvestCapacity * 0.4).toLocaleString('en-IN')}/mo to Nifty 50 SIP</strong>, ₹{Math.round(monthlyInvestCapacity * 0.25).toLocaleString('en-IN')}/mo to Emergency Fund, and ₹{Math.round(monthlyInvestCapacity * 0.2).toLocaleString('en-IN')}/mo to Flexi-Cap Funds.</>
              )}
              {riskProfile === 'Conservative' && (
                <> Allocate <strong className="text-blue-400">₹{Math.round(monthlyInvestCapacity * 0.35).toLocaleString('en-IN')}/mo to Emergency Buffer</strong>, ₹{Math.round(monthlyInvestCapacity * 0.25).toLocaleString('en-IN')}/mo to PPF, and ₹{Math.round(monthlyInvestCapacity * 0.2).toLocaleString('en-IN')}/mo to Index SIP.</>
              )}
              {riskProfile === 'Aggressive' && (
                <> Allocate <strong className="text-rose-400">₹{Math.round(monthlyInvestCapacity * 0.45).toLocaleString('en-IN')}/mo to Nifty 50 Index SIP</strong> and ₹{Math.round(monthlyInvestCapacity * 0.30).toLocaleString('en-IN')}/mo to Flexi-Cap Equity Funds.</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Products Grid */}
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Suitable Investment Instruments</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {baseProducts.map(p => {
            const ratio = p.allocationRatio[riskProfile] || 0
            const suggestedAmount = Math.round(monthlyInvestCapacity * ratio)

            return (
              <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl">
                        {p.emoji}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColors[p.tagColor]}`}>{p.tag}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{p.desc}</p>

                  <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-center mb-4 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-[10px] text-slate-400">Risk</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.risk}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Exp. Returns</p>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{p.returns}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Horizon</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{p.horizon}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Suggested Monthly Allocation</p>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{suggestedAmount.toLocaleString('en-IN')}/mo
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
