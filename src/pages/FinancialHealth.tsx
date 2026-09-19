import { CheckCircle, AlertCircle, TrendingUp, Sparkles } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

const score = 83

const metrics = [
  { label: 'Savings Ratio', value: 38, max: 50, score: 80, status: 'good', desc: 'You save 38% of income. Above the recommended 20%.', color: '#10B981' },
  { label: 'Budget Discipline', value: 5, max: 6, score: 84, status: 'good', desc: '5 of 6 categories within budget this month.', color: '#3B82F6' },
  { label: 'Debt Ratio', value: 31, max: 40, score: 72, status: 'good', desc: 'EMI-to-income at 31%. Below the 40% safe limit.', color: '#6366F1' },
  { label: 'Emergency Fund', value: 2, max: 6, score: 40, status: 'warning', desc: 'You have 2 months covered. Target is 6 months.', color: '#F59E0B' },
  { label: 'Bill Payment History', value: 11, max: 12, score: 92, status: 'good', desc: '11/12 bills paid on time this year.', color: '#10B981' },
  { label: 'Investment Diversification', value: 3, max: 5, score: 65, status: 'ok', desc: 'Invested in 3 asset classes. Add bonds or gold.', color: '#8B5CF6' },
]

const timeline = [
  { month: 'Feb', score: 64 },
  { month: 'Mar', score: 68 },
  { month: 'Apr', score: 72 },
  { month: 'May', score: 75 },
  { month: 'Jun', score: 79 },
  { month: 'Jul', score: 83 },
]

const recs = [
  { icon: '🛡️', title: 'Build Emergency Fund', desc: 'Add ₹10,000/month to reach a 6-month fund by December 2025.', type: 'warning' },
  { icon: '🍽️', title: 'Reduce Dining Expenses', desc: 'Dining spend is 18% above last month. Cut by ₹2,000 to stay on budget.', type: 'warning' },
  { icon: '📈', title: 'Increase Monthly SIP', desc: 'Bump your SIP by ₹1,000/month — it could grow to ₹5.2L in 10 years.', type: 'tip' },
  { icon: '🎉', title: "Healthier Than Last Month", desc: 'Your score rose 4 points. Keep it up — you\'re on the right track!', type: 'positive' },
]

function BigGauge({ score }: { score: number }) {
  const r = 110, cx = 140, cy = 140
  const c = 2 * Math.PI * r
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#FB7185'
  return (
    <div className="relative w-72 h-72 flex items-center justify-center mx-auto">
      <svg width="280" height="280" viewBox="0 0 280 280">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${c * 0.75} ${c * 0.25}`} strokeDashoffset={0}
          transform={`rotate(135 ${cx} ${cy})`} className="dark:stroke-slate-800" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="18" strokeLinecap="round"
          strokeDasharray={`${c * (score / 100) * 0.75} ${c}`} strokeDashoffset={0}
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 12px ${color}80)`, transition: 'stroke-dasharray 1.2s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-black" style={{ color }}>{score}</span>
        <span className="text-slate-400 text-sm mt-1">out of 100</span>
        <span className="mt-2 text-sm font-bold px-3 py-1 rounded-full" style={{ background: `${color}15`, color }}>
          {score >= 80 ? '🌟 Excellent' : score >= 60 ? '👍 Good' : '⚠️ Needs Work'}
        </span>
      </div>
    </div>
  )
}

export default function FinancialHealth() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Health Score</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your comprehensive wellness report — July 2025</p>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-emerald-500/8 blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <p className="text-slate-400 text-sm font-medium mb-6 uppercase tracking-widest">Finshpere · Financial Health</p>
          <BigGauge score={score} />
          <p className="text-slate-300 text-sm mt-4 max-w-sm">
            Your score improved by <span className="text-emerald-400 font-bold">+4 points</span> since last month. You're in the top 28% of Finshpere users.
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Score Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{m.label}</span>
                <div className="flex items-center gap-1.5">
                  {m.status === 'good' && <CheckCircle size={13} className="text-emerald-500" />}
                  {m.status === 'warning' && <AlertCircle size={13} className="text-amber-500" />}
                  {m.status === 'ok' && <AlertCircle size={13} className="text-blue-400" />}
                  <span className="text-sm font-bold" style={{ color: m.color }}>{m.score}</span>
                </div>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <div className="h-full rounded-full" style={{ width: `${m.score}%`, backgroundColor: m.color }} />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Financial Health Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis domain={[55, 90]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={v => [`${v} / 100`, 'Score']}
            />
            <Line type="monotone" dataKey="score" stroke="#10B981" strokeWidth={3}
              dot={{ fill: '#10B981', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-2">+19 points in 6 months 🎉</p>
      </div>

      {/* AI Recommendations */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
          AI Recommendations
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {recs.map((r, i) => (
            <div key={i} className={`rounded-2xl p-5 border ${
              r.type === 'warning' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40'
              : r.type === 'positive' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/40'
            }`}>
              <span className="text-2xl block mb-2">{r.icon}</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{r.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
