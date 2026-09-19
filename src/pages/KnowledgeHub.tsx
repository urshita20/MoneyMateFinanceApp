import { useState, useEffect } from 'react'
import { Search, BookOpen, ExternalLink, Clock, ShieldCheck, Tag, Award, Sparkles, Filter } from 'lucide-react'
import { dataStore } from '../services/dataStore'
import type { Page } from '../types'

interface KnowledgeHubProps {
  onNav?: (p: Page) => void
}

export interface ArticleItem {
  id: string
  title: string
  category: 'Tax' | 'RBI & Banking' | 'Investing' | 'Insurance' | 'Government Schemes' | 'Financial Literacy'
  summary: string
  source: string
  url: string
  readTime: string
  verifiedFY: string
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'red' | 'slate'
  tags: string[]
}

const ARTICLES_DATABASE: ArticleItem[] = [
  // TAX
  {
    id: 'tax-1',
    title: 'New vs. Old Tax Regime Comparison Guide (FY 2024-25 / FY 2025-26)',
    category: 'Tax',
    summary: 'Official breakdown of tax slabs, Section 87A rebate up to ₹7.5 Lakhs gross income, standard deduction of ₹75,000, and 80C/80D deduction comparison.',
    source: 'Income Tax Department of India',
    url: 'https://incometaxindia.gov.in',
    readTime: '6 min read',
    verifiedFY: 'FY 2024-25 / 2025',
    color: 'emerald',
    tags: ['tax', 'income tax', 'slabs', '87a', 'deductions'],
  },
  {
    id: 'tax-2',
    title: 'Guide to Filing Income Tax Returns (ITR-1 / ITR-2) Online',
    category: 'Tax',
    summary: 'Step-by-step tutorial on filing your annual return, verifying Form 26AS & AIS (Annual Information Statement), and claiming TDS refunds.',
    source: 'Income Tax e-Filing Portal',
    url: 'https://www.incometax.gov.in/iec/foportal',
    readTime: '8 min read',
    verifiedFY: 'FY 2024-25',
    color: 'blue',
    tags: ['itr', 'tax filing', 'form 26as', 'tds', 'ais'],
  },
  {
    id: 'tax-3',
    title: 'Capital Gains Tax Rules: Short-Term (STCG) vs Long-Term (LTCG)',
    category: 'Tax',
    summary: 'Tax rates on equity investments, property sales, mutual funds, and exemptions under Section 54F.',
    source: 'Income Tax Department of India',
    url: 'https://incometaxindia.gov.in',
    readTime: '5 min read',
    verifiedFY: 'FY 2024-25',
    color: 'emerald',
    tags: ['capital gains', 'stcg', 'ltcg', 'stocks tax', 'mutual fund tax'],
  },

  // RBI & BANKING
  {
    id: 'rbi-1',
    title: 'RBI Charter of Customer Rights & Banking Ombudsman Scheme',
    category: 'RBI & Banking',
    summary: 'Know your rights as a bank customer, zero liability rules for unauthorized digital transactions, and filing RBI complaints.',
    source: 'Reserve Bank of India (RBI)',
    url: 'https://m.rbi.org.in/Scripts/CustomerCare.aspx',
    readTime: '5 min read',
    verifiedFY: 'Current Regulations',
    color: 'blue',
    tags: ['rbi', 'banking rights', 'ombudsman', 'customer rights'],
  },
  {
    id: 'rbi-2',
    title: 'UPI Security, Transaction Limits & Digital Fraud Prevention',
    category: 'RBI & Banking',
    summary: 'Official guidelines on UPI PIN safety, reporting fraudulent transfers within 24 hours, and NPCI daily transaction caps.',
    source: 'NPCI / RBI Official Portal',
    url: 'https://www.npci.org.in/what-we-do/upi/product-overview',
    readTime: '4 min read',
    verifiedFY: 'Current Regulations',
    color: 'purple',
    tags: ['upi', 'digital payment', 'fraud prevention', 'npci', 'banking'],
  },
  {
    id: 'rbi-3',
    title: 'DICGC ₹5 Lakh Deposit Insurance Coverage Explained',
    category: 'RBI & Banking',
    summary: 'How DICGC guarantees bank principal and interest up to ₹5,000,000 per depositor across commercial & savings banks.',
    source: 'Deposit Insurance and Credit Guarantee Corporation (DICGC)',
    url: 'https://www.dicgc.org.in',
    readTime: '4 min read',
    verifiedFY: 'Current Regulations',
    color: 'slate',
    tags: ['dicgc', 'deposit insurance', 'bank safety', 'rbi'],
  },

  // INVESTING
  {
    id: 'inv-1',
    title: 'SEBI Investor Guide: Mutual Funds, SIPs & Rupee-Cost Averaging',
    category: 'Investing',
    summary: 'Official guide to systematic investment plans (SIP), understanding expense ratios, direct vs regular funds, and index investing.',
    source: 'SEBI Investor Education (Saarthi)',
    url: 'https://investor.sebi.gov.in',
    readTime: '7 min read',
    verifiedFY: 'SEBI Verified',
    color: 'purple',
    tags: ['sip', 'mutual funds', 'sebi', 'index funds', 'investing'],
  },
  {
    id: 'inv-2',
    title: 'Understanding Asset Allocation, Risk Profiles & Diversification',
    category: 'Investing',
    summary: 'How to structure your portfolio across equity, debt, gold, and liquid funds based on your financial goals and time horizon.',
    source: 'National Stock Exchange (NSE)',
    url: 'https://www.nseindia.com/invest/first-time-investors',
    readTime: '6 min read',
    verifiedFY: 'NSE Verified',
    color: 'purple',
    tags: ['asset allocation', 'stocks', 'diversification', 'nse'],
  },

  // INSURANCE
  {
    id: 'ins-1',
    title: 'IRDAI Health Insurance Policyholder Protection Rights',
    category: 'Insurance',
    summary: 'Essential checklist for health insurance coverage, cashless hospitalization, pre-existing condition waiting periods, and claim settlement ratio.',
    source: 'IRDAI Official Portal',
    url: 'https://irdai.gov.in',
    readTime: '7 min read',
    verifiedFY: 'IRDAI Guidelines',
    color: 'red',
    tags: ['health insurance', 'irdai', 'cashless', 'claims'],
  },
  {
    id: 'ins-2',
    title: 'Term Life Insurance vs Investment-Linked Plans (ULIPs)',
    category: 'Insurance',
    summary: 'Why pure term life insurance provides maximum financial cover for minimal premium compared to endowment or ULIP policies.',
    source: 'IRDAI Bima Bharosa Portal',
    url: 'https://bimabharosa.irdai.gov.in',
    readTime: '6 min read',
    verifiedFY: 'IRDAI Guidelines',
    color: 'red',
    tags: ['term insurance', 'life insurance', 'ulip', 'irdai'],
  },

  // GOVERNMENT SCHEMES
  {
    id: 'gov-1',
    title: 'Public Provident Fund (PPF) Scheme & 15-Year Maturity Rules',
    category: 'Government Schemes',
    summary: 'Government-backed 7.1% tax-free interest, EEE (Exempt-Exempt-Exempt) tax status under Section 80C, and partial withdrawal rules.',
    source: 'India Post & Ministry of Finance',
    url: 'https://www.indiapost.gov.in/Financial/pages/content/post-office-saving-schemes.aspx',
    readTime: '5 min read',
    verifiedFY: 'Government Scheme',
    color: 'amber',
    tags: ['ppf', 'government scheme', 'post office', 'tax free'],
  },
  {
    id: 'gov-2',
    title: 'National Pension System (NPS) & Additional ₹50,000 Tax Deduction',
    category: 'Government Schemes',
    summary: 'Tier-1 & Tier-2 NPS account features, asset allocation choice, and additional tax deduction under Section 80CCD(1B).',
    source: 'PFRDA (Pension Fund Regulatory & Development Authority)',
    url: 'https://www.pfrda.org.in',
    readTime: '6 min read',
    verifiedFY: 'Government Scheme',
    color: 'amber',
    tags: ['nps', 'pension', 'pfrda', '80ccd', 'tax saving'],
  },

  // FINANCIAL LITERACY
  {
    id: 'lit-1',
    title: 'Understanding Credit Scores (CIBIL / Experian) & Improvement Strategies',
    category: 'Financial Literacy',
    summary: 'How credit utilization, timely EMI payments, and credit mix affect your 300-900 CIBIL score and loan approval rates.',
    source: 'RBI Financial Literacy Center',
    url: 'https://m.rbi.org.in/Scripts/FinancialEducation.aspx',
    readTime: '5 min read',
    verifiedFY: 'RBI Verified',
    color: 'slate',
    tags: ['cibil', 'credit score', 'loans', 'credit card'],
  },
  {
    id: 'lit-2',
    title: 'Building an Emergency Survival Fund (50/30/20 Rule)',
    category: 'Financial Literacy',
    summary: 'Structuring monthly cash flow into 50% Needs, 30% Wants, and 20% Savings to survive unexpected financial shocks.',
    source: 'MoneyMate Educational Center',
    url: 'https://m.rbi.org.in',
    readTime: '4 min read',
    verifiedFY: 'Educational Resource',
    color: 'emerald',
    tags: ['emergency fund', 'budgeting', 'savings', 'literacy'],
  },
]

const categories = ['All', 'Tax', 'RBI & Banking', 'Investing', 'Insurance', 'Government Schemes', 'Financial Literacy']

const colorMap: Record<string, { bg: string; text: string; badge: string }> = {
  blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-900/20', text: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
  amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  red: { bg: 'bg-rose-50 dark:bg-rose-900/20', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' },
  slate: { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
}

export default function KnowledgeHub({ onNav }: KnowledgeHubProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [profile, setProfile] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    setProfile(dataStore.getProfile())
    setSummary(dataStore.getDashboardSummary().summary)
  }, [])

  const monthlyIncome = profile?.monthlyIncome || summary?.monthlyIncome || 0
  const annualIncome = monthlyIncome * 12

  // Tax context calculation
  let taxBracketText = ''
  let taxSlabPercent = 0

  if (annualIncome > 0) {
    if (annualIncome <= 750000) {
      taxBracketText = `At ₹${annualIncome.toLocaleString('en-IN')}/yr, your income qualifies for the 100% Tax-Free Rebate (Section 87A) under the New Tax Regime (₹0 tax payable).`
      taxSlabPercent = 0
    } else if (annualIncome <= 1000000) {
      taxBracketText = `At ₹${annualIncome.toLocaleString('en-IN')}/yr, your income enters the 10% tax slab under New Tax Regime. Section 80C, 80D & NPS deductions can help lower your taxable liability.`
      taxSlabPercent = 10
    } else if (annualIncome <= 1200000) {
      taxBracketText = `At ₹${annualIncome.toLocaleString('en-IN')}/yr, your income enters the 15% tax slab. Explore NPS (Section 80CCD) for additional ₹50,000 tax deduction.`
      taxSlabPercent = 15
    } else if (annualIncome <= 1500000) {
      taxBracketText = `At ₹${annualIncome.toLocaleString('en-IN')}/yr, your income enters the 20% tax slab. Comprehensive tax planning can significantly optimize your tax outlay.`
      taxSlabPercent = 20
    } else {
      taxBracketText = `At ₹${annualIncome.toLocaleString('en-IN')}/yr, your income enters the 30% top tax slab. Maximizing all eligible exemptions & NPS is recommended.`
      taxSlabPercent = 30
    }
  }

  // Personalized Recommendation Filtering
  const recommendedArticles = ARTICLES_DATABASE.filter(art => {
    if (annualIncome > 750000 && art.tags.includes('tax saving')) return true
    if (annualIncome > 0 && art.id === 'tax-1') return true
    if (summary?.savings < (summary?.monthlyIncome * 0.2) && art.tags.includes('emergency fund')) return true
    if (art.category === 'Investing') return true
    return false
  }).slice(0, 2)

  // Filtered Articles based on search & category
  const filtered = ARTICLES_DATABASE.filter(a => {
    const query = search.toLowerCase().trim()
    const matchSearch =
      !query ||
      a.title.toLowerCase().includes(query) ||
      a.summary.toLowerCase().includes(query) ||
      a.source.toLowerCase().includes(query) ||
      a.tags.some(t => t.toLowerCase().includes(query))
    const matchCat = activeCategory === 'All' || a.category === activeCategory
    return matchSearch && matchCat
  })

  return (
    <div className="max-w-4xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-emerald-500" size={24} />
            Knowledge Hub
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized financial resources & official guidance from RBI, SEBI, Income Tax Dept & Government Portals
          </p>
        </div>
      </div>

      {/* Tax Personalization Banner */}
      {annualIncome > 0 ? (
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-violet-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-sm">
            ₹
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Personalized Tax Bracket Context (FY 2024-25 / FY 2025-26)
              </span>
              {taxSlabPercent > 0 && (
                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  {taxSlabPercent}% Slab
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-relaxed">
              {taxBracketText}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="text-emerald-500" size={20} />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Personalize Your Financial & Tax Learning</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Add your annual income in Profile Settings to unlock personalized tax slab guides and recommendations.</p>
            </div>
          </div>
          {onNav && (
            <button
              onClick={() => onNav('settings')}
              className="text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl transition-all flex-shrink-0"
            >
              Add Income in Settings
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search financial knowledge — taxes, RBI rules, SIPs, insurance, credit score..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
          <Filter size={12} /> Filter:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <p className="text-xs text-slate-400 font-medium">
        Showing {filtered.length} official financial {filtered.length === 1 ? 'resource' : 'resources'}
      </p>

      {/* Recommended for You Section (if category is All and search is empty) */}
      {!search && activeCategory === 'All' && recommendedArticles.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} className="text-amber-500" />
            Recommended For You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedArticles.map(art => (
              <div
                key={`rec_${art.id}`}
                className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-md relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Recommended · {art.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} /> {art.readTime}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{art.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-2">{art.summary}</p>
                </div>
                <div className="relative flex items-center justify-between pt-2 border-t border-white/10">
                  <span className="text-[10px] text-slate-400 font-medium">Source: {art.source}</span>
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors shadow-sm"
                  >
                    Read Article <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(article => {
          const colors = colorMap[article.color] || colorMap.slate
          return (
            <div
              key={article.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${colors.badge}`}>
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Clock size={11} />
                    {article.readTime}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                  {article.summary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-500" />
                    {article.source}
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{article.verifiedFY}</p>
                </div>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${colors.text} hover:underline`}
                >
                  Read Article <ExternalLink size={11} />
                </a>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching articles found</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Try searching for keywords like "tax", "SIP", "RBI", or "insurance".</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Reset Search Filters
          </button>
        </div>
      )}

      {/* Trust & Verification Disclaimer Footer */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          🏛️ All Knowledge Hub articles link directly to official regulatory authorities including the Income Tax Department of India, RBI, SEBI, IRDAI, PFRDA, and Ministry of Finance. Information verified for FY 2024-25 / FY 2025-26.
        </p>
      </div>
    </div>
  )
}
