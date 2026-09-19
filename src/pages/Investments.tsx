import { useState } from 'react'
import { Sparkles, ChevronRight, Info, CheckCircle } from 'lucide-react'

const products = [
  {
    emoji: '🛡️', name: 'Emergency Fund', risk: 'No Risk', returns: '3–4%', horizon: '1–6 months',
    suitedFor: 'Everyone — must have first', tag: 'Priority', tagColor: 'rose',
    desc: 'A liquid safety net of 6 months of expenses. Keep in high-yield savings or liquid mutual fund.',
  },
  {
    emoji: '🏦', name: 'Fixed Deposit', risk: 'Very Low', returns: '6.5–7.5%', horizon: '1–5 years',
    suitedFor: 'Conservative investors', tag: 'Stable', tagColor: 'blue',
    desc: 'Guaranteed returns with DICGC insurance up to ₹5L. Best for short-term goals.',
  },
  {
    emoji: '📈', name: 'SIP (Mutual Fund)', risk: 'Moderate', returns: '10–14%', horizon: '5+ years',
    suitedFor: 'Beginners & salaried', tag: 'Recommended', tagColor: 'emerald',
    desc: 'Invest a fixed amount monthly. Rupee-cost averaging reduces market timing risk.',
  },
  {
    emoji: '🧩', name: 'Mutual Funds', risk: 'Moderate–High', returns: '10–18%', horizon: '3–7 years',
    suitedFor: 'Growth-oriented investors', tag: 'Popular', tagColor: 'violet',
    desc: 'Diversified exposure across equities. ELSS funds also offer ₹1.5L tax deduction.',
  },
  {
    emoji: '📊', name: 'ETFs', risk: 'Moderate', returns: '10–15%', horizon: '3+ years',
    suitedFor: 'Index investors', tag: 'Low Cost', tagColor: 'indigo',
    desc: 'Track Nifty 50 or Sensex passively. Lower expense ratios than active funds.',
  },
  {
    emoji: '🥇', name: 'Digital Gold', risk: 'Moderate', returns: '8–12%', horizon: '3–5 years',
    suitedFor: 'Inflation hedge seekers', tag: 'Hedge', tagColor: 'amber',
    desc: 'Buy and sell gold digitally via MMTC-PAMP or Sovereign Gold Bonds for extra returns.',
  },
  {
    emoji: '🏛️', name: 'PPF', risk: 'No Risk', returns: '7.1%', horizon: '15 years',
    suitedFor: 'Tax savers / long-term', tag: 'Tax Free', tagColor: 'green',
    desc: 'Fully tax-free interest and maturity. Lock-in for 15 years — great for retirement.',
  },
  {
    emoji: '🏢', name: 'NPS', risk: 'Low–Moderate', returns: '9–12%', horizon: 'Till retirement',
    suitedFor: 'Retirement planning', tag: 'Tax Benefit', tagColor: 'teal',
    desc: 'Additional ₹50,000 tax deduction under 80CCD(1B). Market-linked pension corpus.',
  },
]

const riskColors: Record<string, { bg: string; text: string }> = {
  'No Risk':       { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
  'Very Low':      { bg: 'bg-blue-50 dark:bg-blue-900/20',       text: 'text-blue-600 dark:text-blue-400' },
  'Moderate':      { bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-600 dark:text-amber-400' },
  'Moderate–High': { bg: 'bg-orange-50 dark:bg-orange-900/20',   text: 'text-orange-600 dark:text-orange-400' },
  'Low–Moderate':  { bg: 'bg-sky-50 dark:bg-sky-900/20',         text: 'text-sky-600 dark:text-sky-400' },
}

const tagColors: Record<string, string> = {
  rose:    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  blue:    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  violet:  'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
  indigo:  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  amber:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  green:   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  teal:    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400',
}

const profiles = ['Conservative', 'Moderate', 'Aggressive'] as const
type Risk = typeof profiles[number]

export default function Investments() {
  const [riskProfile, setRiskProfile] = useState<Risk>('Moderate')

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-emerald-100" />
              <span className="text-sm font-semibold text-emerald-100 uppercase tracking-wider">AI-Powered</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Personalised Investment Suggestions</h1>
            <p className="text-emerald-100 text-sm">Based on your income ₹85,000, savings rate 38%, and risk profile.</p>
          </div>
          <div className="text-center bg-white/10 border border-white/20 rounded-2xl p-4 text-white flex-shrink-0">
            <p className="text-3xl font-black">₹8,000</p>
            <p className="text-xs text-emerald-100 mt-0.5">Monthly invest capacity</p>
          </div>
        </div>
      </div>

      {/* Risk profile widget */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Your Risk Profile</h3>
            <p className="text-xs text-slate-400 mt-0.5">Affects which instruments are highlighted for you</p>
          </div>
          <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full">
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
        <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: riskProfile === 'Conservative' ? '25%' : riskProfile === 'Moderate' ? '55%' : '90%',
              background: riskProfile === 'Conservative' ? '#3B82F6' : riskProfile === 'Moderate' ? '#10B981' : '#FB7185',
            }}
          />
        </div>
      </div>

      {/* AI recommendation panel */}
      <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white mb-2">Finshpere Recommendation</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Based on your income and savings, <strong className="text-emerald-400">start with a 6-month emergency fund first</strong> (₹3.1L target).
              Then allocate <strong className="text-white">₹3,000/month to a Nifty 50 index SIP</strong>, ₹2,000 to PPF, and ₹1,500 to a flexi-cap mutual fund.
              This balanced approach suits your <strong className="text-white">{riskProfile}</strong> risk profile.
            </p>
            <div className="flex gap-2 mt-3">
              {['SIP First', 'PPF for tax', 'FD as buffer'].map(tag => (
                <span key={tag} className="text-xs bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-medium">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Investment Options</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map(p => {
            const rc = riskColors[p.risk] || riskColors['Moderate']
            return (
              <div key={p.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-2xl">
                      {p.emoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tagColors[p.tagColor]}`}>{p.tag}</span>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                    <Info size={14} />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{p.desc}</p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Risk', value: p.risk, extra: rc },
                    { label: 'Returns', value: p.returns },
                    { label: 'Horizon', value: p.horizon },
                  ].map(f => (
                    <div key={f.label} className="text-center">
                      <p className="text-xs text-slate-400 mb-0.5">{f.label}</p>
                      <p className={`text-xs font-bold ${f.extra ? `${f.extra.bg} ${f.extra.text} px-1.5 py-0.5 rounded-lg` : 'text-slate-900 dark:text-white'}`}>
                        {f.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-400">Best for: <span className="text-slate-600 dark:text-slate-300 font-medium">{p.suitedFor}</span></p>
                  <button className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline group-hover:gap-2 transition-all">
                    Learn more <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
