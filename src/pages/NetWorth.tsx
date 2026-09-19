import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const assets = [
  { name: 'Savings Account', value: 124500, category: 'Liquid', emoji: '🏦', color: '#10B981' },
  { name: 'Fixed Deposits', value: 200000, category: 'Fixed', emoji: '📋', color: '#3B82F6' },
  { name: 'Mutual Funds & SIP', value: 171000, category: 'Investments', emoji: '📈', color: '#6366F1' },
  { name: 'Stocks & ETFs', value: 83320, category: 'Investments', emoji: '📊', color: '#8B5CF6' },
  { name: 'Gold (Digital)', value: 64200, category: 'Commodities', emoji: '🥇', color: '#F59E0B' },
  { name: 'PPF Balance', value: 88000, category: 'Retirement', emoji: '🏛️', color: '#14B8A6' },
  { name: 'Vehicle (Car)', value: 520000, category: 'Physical', emoji: '🚗', color: '#F97316' },
]

const liabilities = [
  { name: 'Home Loan', value: 3820000, category: 'Loan', emoji: '🏠', color: '#FB7185' },
  { name: 'Car Loan', value: 320000, category: 'Loan', emoji: '🚗', color: '#F43F5E' },
  { name: 'Education Loan', value: 95000, category: 'Loan', emoji: '🎓', color: '#FCA5A5' },
]

const totalAssets = assets.reduce((a, x) => a + x.value, 0)
const totalLiabilities = liabilities.reduce((a, x) => a + x.value, 0)
const netWorth = totalAssets - totalLiabilities

const growthData = [
  { month: 'Jan', nw: -2800000 },
  { month: 'Feb', nw: -2600000 },
  { month: 'Mar', nw: -2400000 },
  { month: 'Apr', nw: -2200000 },
  { month: 'May', nw: -2050000 },
  { month: 'Jun', nw: -1900000 },
  { month: 'Jul', nw: netWorth },
]

const avData = [
  { month: 'Jan', assets: 1150000, liabilities: 3950000 },
  { month: 'Mar', assets: 1180000, liabilities: 3810000 },
  { month: 'May', assets: 1220000, liabilities: 3670000 },
  { month: 'Jul', assets: totalAssets, liabilities: totalLiabilities },
]

const pieData = assets.map(a => ({ name: a.name, value: a.value, color: a.color }))

const fmt = (v: number) => {
  const abs = Math.abs(v)
  if (abs >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`
  if (abs >= 100000) return `${(v / 100000).toFixed(1)}L`
  return `${(v / 1000).toFixed(0)}K`
}

export default function NetWorth() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Net Worth Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Assets − Liabilities — July 2025</p>
      </div>

      {/* Hero net worth card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl -translate-x-1/4 translate-y-1/4" />
        </div>
        <div className="relative">
          <p className="text-slate-400 text-sm mb-4 uppercase tracking-widest font-medium">Total Net Worth</p>
          <div className="flex items-end gap-4 mb-6">
            <p className={`text-5xl font-black ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netWorth < 0 ? '-' : '+'}₹{fmt(Math.abs(netWorth))}
            </p>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold mb-1.5">
              <TrendingUp size={14} />
              +₹{fmt(150000)} vs last month
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Total Assets</p>
              <p className="text-2xl font-black text-emerald-400">₹{fmt(totalAssets)}</p>
              <p className="text-xs text-slate-400 mt-1">{assets.length} items</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Total Liabilities</p>
              <p className="text-2xl font-black text-rose-400">₹{fmt(totalLiabilities)}</p>
              <p className="text-xs text-slate-400 mt-1">{liabilities.length} loans</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-slate-400 text-xs mb-1">Debt-to-Asset Ratio</p>
              <p className="text-2xl font-black text-amber-400">{((totalLiabilities / totalAssets) * 100).toFixed(0)}%</p>
              <p className="text-xs text-slate-400 mt-1">Moderate — reducing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Net worth growth */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Net Worth Growth</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${fmt(v)}`} width={50} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${fmt(Number(v))}`, 'Net Worth']} />
              <Area type="monotone" dataKey="nw" stroke="#10B981" strokeWidth={2.5} fill="url(#nwGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Assets vs liabilities bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Assets vs Liabilities</h3>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" />Assets</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-rose-400 inline-block" />Liabilities</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={avData} barSize={18} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${fmt(v)}`} width={48} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} formatter={v => [`₹${fmt(Number(v))}`, '']} />
              <Bar dataKey="assets" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liabilities" fill="#FB7185" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset distribution pie */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={60} paddingAngle={2} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => [`₹${fmt(Number(v))}`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                <span className="text-slate-500 dark:text-slate-400 flex-1 truncate">{d.name}</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asset details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Assets</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {assets.map(a => (
              <div key={a.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.category}</p>
                </div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">₹{fmt(a.value)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Liability details */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-rose-50/50 dark:bg-rose-900/10">
            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Liabilities</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {liabilities.map(l => (
              <div key={l.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-base">{l.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{l.name}</p>
                  <p className="text-xs text-slate-400">{l.category}</p>
                </div>
                <p className="text-xs font-bold text-rose-500 dark:text-rose-400 flex-shrink-0">₹{fmt(l.value)}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-slate-500">Net Worth</span>
              <span className={`font-black ${netWorth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {netWorth < 0 ? '-' : '+'}₹{fmt(Math.abs(netWorth))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
