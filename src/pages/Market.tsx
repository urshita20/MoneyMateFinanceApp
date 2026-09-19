import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

// Mini sparkline data
const spark = (base: number, vol: number) =>
  Array.from({ length: 12 }, (_, i) => ({ v: base + (Math.sin(i * 0.8) * vol) + (i * vol * 0.05) }))

const indices = [
  { name: 'Nifty 50', value: '24,302.45', change: '+186.30', pct: '+0.77%', pos: true, color: '#10B981', data: spark(24000, 200) },
  { name: 'Sensex', value: '80,148.88', change: '+524.80', pct: '+0.66%', pos: true, color: '#10B981', data: spark(79800, 400) },
  { name: 'Nifty Bank', value: '52,318.60', change: '-210.45', pct: '-0.40%', pos: false, color: '#FB7185', data: spark(52500, 300) },
  { name: 'Gold (10g)', value: '₹72,450', change: '+₹320', pct: '+0.44%', pos: true, color: '#F59E0B', data: spark(72000, 400) },
  { name: 'Silver (1kg)', value: '₹90,200', change: '-₹180', pct: '-0.20%', pos: false, color: '#FB7185', data: spark(90400, 300) },
  { name: 'USD / INR', value: '83.42', change: '+0.12', pct: '+0.14%', pos: true, color: '#6366F1', data: spark(83.2, 0.2) },
  { name: 'Bitcoin', value: '$67,842', change: '+$1,240', pct: '+1.86%', pos: true, color: '#F97316', data: spark(66500, 800) },
  { name: 'Crude Oil', value: '$82.4/bbl', change: '-$0.60', pct: '-0.72%', pos: false, color: '#FB7185', data: spark(83, 0.8) },
]

const trending = [
  { ticker: 'RELIANCE', name: 'Reliance Industries', price: '₹2,960', change: '+1.82%', pos: true, mktcap: '₹20.0L Cr' },
  { ticker: 'TCS', name: 'Tata Consultancy Services', price: '₹3,820', change: '+0.94%', pos: true, mktcap: '₹13.9L Cr' },
  { ticker: 'HDFCBANK', name: 'HDFC Bank', price: '₹1,642', change: '-0.38%', pos: false, mktcap: '₹12.4L Cr' },
  { ticker: 'INFY', name: 'Infosys Ltd', price: '₹1,390', change: '-1.44%', pos: false, mktcap: '₹5.8L Cr' },
  { ticker: 'ITC', name: 'ITC Limited', price: '₹464', change: '+2.10%', pos: true, mktcap: '₹5.8L Cr' },
  { ticker: 'BAJFINANCE', name: 'Bajaj Finance', price: '₹6,980', change: '+1.24%', pos: true, mktcap: '₹4.2L Cr' },
]

const sectors = [
  { name: 'IT', change: '+1.4%', pos: true },
  { name: 'Banking', change: '-0.3%', pos: false },
  { name: 'Auto', change: '+0.9%', pos: true },
  { name: 'Pharma', change: '+1.7%', pos: true },
  { name: 'FMCG', change: '+0.2%', pos: true },
  { name: 'Metal', change: '-0.8%', pos: false },
  { name: 'Realty', change: '+2.1%', pos: true },
  { name: 'Energy', change: '-1.2%', pos: false },
]

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  return (
    <ResponsiveContainer width={80} height={36}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} />
        <Tooltip contentStyle={{ display: 'none' }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default function Market() {
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Market Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Live market data — Jul 19, 2025 · {now} IST</p>
        </div>
        <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 text-sm font-medium px-3 py-2 rounded-xl transition-colors">
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* Market status banner */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl px-5 py-3 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm text-emerald-800 dark:text-emerald-300 font-medium">
          Markets are <strong>open</strong> — NSE/BSE trading session · Closes at 3:30 PM IST
        </p>
      </div>

      {/* Index + commodity cards */}
      <div className="grid grid-cols-4 gap-4">
        {indices.map(idx => (
          <div key={idx.name} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{idx.name}</p>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${idx.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {idx.pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {idx.pct}
              </div>
            </div>
            <p className="text-base font-black text-slate-900 dark:text-white mb-0.5">{idx.value}</p>
            <p className={`text-xs font-semibold mb-2 ${idx.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>{idx.change}</p>
            <Sparkline data={idx.data} color={idx.color} />
          </div>
        ))}
      </div>

      {/* Sector performance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Sector Performance Today</h3>
        <div className="flex gap-2 flex-wrap">
          {sectors.map(s => (
            <div key={s.name} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold ${
              s.pos
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
            }`}>
              {s.pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {s.name} <span className="font-bold">{s.change}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending stocks */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Trending Stocks</h3>
          <span className="text-xs text-slate-400">NSE · Live prices</span>
        </div>
        <div>
          {trending.map((s, i) => (
            <div key={s.ticker} className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-400 flex-shrink-0">
                {s.ticker.slice(0, 3)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.ticker}</p>
                <p className="text-xs text-slate-400 truncate">{s.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.price}</p>
                <p className="text-xs text-slate-400">MCap: {s.mktcap}</p>
              </div>
              <div className={`flex items-center gap-1 w-20 justify-end text-sm font-bold ${s.pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                {s.pos ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {s.change}
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors">Buy</button>
                <button className="text-xs font-semibold bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors">Sell</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
