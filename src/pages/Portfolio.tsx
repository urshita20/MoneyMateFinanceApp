import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'

const growthData = [
  { month: 'Jan', value: 180000 }, { month: 'Feb', value: 194000 },
  { month: 'Mar', value: 188000 }, { month: 'Apr', value: 210000 },
  { month: 'May', value: 226000 }, { month: 'Jun', value: 238000 },
  { month: 'Jul', value: 254320 },
]

const allocationData = [
  { name: 'Large Cap', value: 38, color: '#3B82F6' },
  { name: 'Mid Cap', value: 24, color: '#10B981' },
  { name: 'Small Cap', value: 18, color: '#F59E0B' },
  { name: 'Debt/Bond', value: 10, color: '#6366F1' },
  { name: 'Gold', value: 10, color: '#F97316' },
]

const monthlyReturns = [
  { month: 'Feb', ret: 3.2 }, { month: 'Mar', ret: -2.1 },
  { month: 'Apr', ret: 5.8 }, { month: 'May', ret: 4.1 },
  { month: 'Jun', ret: 2.9 }, { month: 'Jul', ret: 3.7 },
]

const holdings = [
  { name: 'HDFC Top 100 Fund', type: 'Mutual Fund', qty: '—', avg: '₹—', current: '₹82,400', day: '+1.2%', pnl: '+₹12,400', dayPos: true, pnlPos: true },
  { name: 'Reliance Industries', type: 'Stock', qty: '12', avg: '₹2,180', current: '₹2,960', day: '-0.8%', pnl: '+₹9,360', dayPos: false, pnlPos: true },
  { name: 'Nifty 50 Index ETF', type: 'ETF', qty: '50', avg: '₹182', current: '₹228', day: '+0.6%', pnl: '+₹2,300', dayPos: true, pnlPos: true },
  { name: 'Infosys Ltd', type: 'Stock', qty: '8', avg: '₹1,480', current: '₹1,390', day: '-1.4%', pnl: '-₹720', dayPos: false, pnlPos: false },
  { name: 'SBI Small Cap Fund', type: 'Mutual Fund', qty: '—', avg: '₹—', current: '₹44,200', day: '+2.1%', pnl: '+₹8,200', dayPos: true, pnlPos: true },
  { name: 'Sovereign Gold Bond', type: 'Bond', qty: '10g', avg: '₹5,900', current: '₹6,420', day: '+0.3%', pnl: '+₹5,200', dayPos: true, pnlPos: true },
]

export default function Portfolio() {
  const todayGain = +3842
  const totalInvested = 217200
  const currentValue = 254320
  const totalReturn = currentValue - totalInvested

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio & Stock History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Your investment portfolio overview — July 2025</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Portfolio Value', value: `₹${(currentValue / 1000).toFixed(1)}K`, sub: 'Total current value', color: 'bg-emerald-500', pos: true, badge: '+17.1% all time' },
          { label: "Today's Gain/Loss", value: `+₹${todayGain.toLocaleString()}`, sub: '+1.54% today', color: 'bg-blue-500', pos: true, badge: 'Market open' },
          { label: 'Overall Returns', value: `+₹${totalReturn.toLocaleString()}`, sub: `${((totalReturn / totalInvested) * 100).toFixed(1)}% returns`, color: 'bg-violet-500', pos: true, badge: 'All time' },
          { label: 'Total Invested', value: `₹${(totalInvested / 1000).toFixed(1)}K`, sub: 'Across 6 instruments', color: 'bg-amber-500', pos: true, badge: 'Principal' },
        ].map(c => (
          <div key={c.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 ${c.color} rounded-xl flex items-center justify-center shadow-sm`}>
                <TrendingUp size={15} className="text-white" />
              </div>
              <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                {c.badge}
              </span>
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{c.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Growth line */}
        <div className="col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio Growth</h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">+41.3% since Jan</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={growthData}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}K`} width={42} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${Number(v).toLocaleString()}`, 'Value']} />
              <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2.5}
                dot={false} activeDot={{ r: 5, fill: '#10B981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Asset Allocation</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={allocationData} cx="50%" cy="50%" innerRadius={40} outerRadius={62} paddingAngle={3} dataKey="value">
                {allocationData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {allocationData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="flex-1 truncate">{d.name}</span>
                <span className="font-bold text-slate-900 dark:text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly returns bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Monthly Returns (%)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyReturns} barSize={36}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} width={32} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`${v}%`, 'Return']} />
            <Bar dataKey="ret" radius={[6, 6, 0, 0]}>
              {monthlyReturns.map((e, i) => <Cell key={i} fill={e.ret >= 0 ? '#10B981' : '#FB7185'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Holdings table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Holdings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                {['Stock / Fund', 'Type', 'Qty', 'Avg Price', 'Current', "Today's Chg", 'P&L'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((h, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{h.name}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{h.type}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{h.qty}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600 dark:text-slate-400">{h.avg}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-slate-900 dark:text-white">{h.current}</td>
                  <td className="px-5 py-3.5">
                    <div className={`flex items-center gap-1 text-sm font-semibold ${h.dayPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {h.dayPos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                      {h.day}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-bold ${h.pnlPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                      {h.pnl}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Portfolio Insights */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Sparkles size={14} className="text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-white">AI Portfolio Insights</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { text: 'Technology stocks form 62% of your equity portfolio. High concentration risk.', icon: '⚠️', type: 'warn' },
              { text: 'Consider diversifying into healthcare and banking sectors for better balance.', icon: '💡', type: 'tip' },
              { text: 'Portfolio volatility increased by 8% this month. Review small-cap exposure.', icon: '📊', type: 'info' },
            ].map((tip, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
                <span className="text-2xl block mb-2">{tip.icon}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
