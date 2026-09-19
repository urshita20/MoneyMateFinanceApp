import { useState } from 'react'
import { Search, BookOpen, ExternalLink, Clock } from 'lucide-react'
import { knowledgeArticles } from '../data/mockData'

const categories = ['All', 'Tax', 'RBI', 'Investments', 'Insurance', 'Government Schemes', 'Banking']

const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  red: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
}

export default function KnowledgeHub() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = knowledgeArticles.filter(a => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
    const matchCat = activeCategory === 'All' || a.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Knowledge Hub</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          AI-powered answers to your financial questions — sourced from RBI, SEBI, and trusted publications
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search financial topics — taxes, investments, insurance..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-slate-400">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'} found
      </p>

      {/* Featured article */}
      {filtered.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative">
            <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full">
              Featured · {filtered[0].category}
            </span>
            <h2 className="text-lg font-bold text-white mt-3 mb-2">{filtered[0].title}</h2>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{filtered[0].summary}</p>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                <BookOpen size={14} />
                Read Article
              </button>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock size={11} />
                {filtered[0].readTime} read
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Article grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.slice(1).map((article, i) => {
          const colors = colorMap[article.color] || colorMap.slate
          return (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.badge}`}>
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock size={10} />
                  {article.readTime}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                {article.summary}
              </p>
              {article.source && (
                <p className="text-[10px] text-slate-400 font-medium mb-3">Source: {article.source}</p>
              )}
              <button className={`flex items-center gap-1.5 text-xs font-semibold ${colors.text} hover:underline`}>
                Read more <ExternalLink size={11} />
              </button>
            </div>
          )
        })}
      </div>

      {/* AI RAG note */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          📚 Knowledge powered by AI (RAG) — sourced from RBI circulars, SEBI guidelines, Income Tax Act, and
          peer-reviewed financial publications. Last updated: July 2025.
        </p>
      </div>
    </div>
  )
}
