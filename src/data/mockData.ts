export const spendingByCategory = [
  { name: 'Food', value: 28, color: '#F97316' },
  { name: 'Housing', value: 22, color: '#6366F1' },
  { name: 'Transport', value: 15, color: '#3B82F6' },
  { name: 'Shopping', value: 18, color: '#EC4899' },
  { name: 'Entertainment', value: 8, color: '#8B5CF6' },
  { name: 'Others', value: 9, color: '#64748B' },
]

export const monthlyData = [
  { month: 'Feb', income: 82000, expense: 48000 },
  { month: 'Mar', income: 85000, expense: 53000 },
  { month: 'Apr', income: 85000, expense: 49000 },
  { month: 'May', income: 87000, expense: 56000 },
  { month: 'Jun', income: 85000, expense: 51000 },
  { month: 'Jul', income: 85000, expense: 52340 },
]

export const weeklyTrend = [
  { day: 'Mon', amount: 1200 },
  { day: 'Tue', amount: 3400 },
  { day: 'Wed', amount: 890 },
  { day: 'Thu', amount: 2100 },
  { day: 'Fri', amount: 4500 },
  { day: 'Sat', amount: 6800 },
  { day: 'Sun', amount: 2300 },
]

export const transactions = [
  { id: 1, merchant: 'Swiggy', category: 'Food', amount: -450, date: 'Jul 18', emoji: '🍕' },
  { id: 2, merchant: 'HDFC Salary', category: 'Income', amount: 85000, date: 'Jul 1', emoji: '💰' },
  { id: 3, merchant: 'Uber', category: 'Transport', amount: -280, date: 'Jul 17', emoji: '🚗' },
  { id: 4, merchant: 'Amazon', category: 'Shopping', amount: -2340, date: 'Jul 16', emoji: '🛍️' },
  { id: 5, merchant: 'Netflix', category: 'Entertainment', amount: -649, date: 'Jul 15', emoji: '🎬' },
  { id: 6, merchant: 'Apollo Pharmacy', category: 'Health', amount: -890, date: 'Jul 14', emoji: '💊' },
  { id: 7, merchant: 'Zomato', category: 'Food', amount: -320, date: 'Jul 13', emoji: '🍔' },
  { id: 8, merchant: 'BPCL Petrol', category: 'Transport', amount: -2500, date: 'Jul 12', emoji: '⛽' },
]

export const budgetCategories = [
  { category: 'Food & Dining', budget: 15000, spent: 12400, emoji: '🍕', color: '#F97316' },
  { category: 'Transport', budget: 6000, spent: 4200, emoji: '🚗', color: '#3B82F6' },
  { category: 'Shopping', budget: 10000, spent: 8900, emoji: '🛍️', color: '#EC4899' },
  { category: 'Entertainment', budget: 3000, spent: 3200, emoji: '🎬', color: '#8B5CF6' },
  { category: 'Health', budget: 5000, spent: 1890, emoji: '💊', color: '#10B981' },
  { category: 'Utilities', budget: 4000, spent: 3100, emoji: '⚡', color: '#F59E0B' },
]

export const goals = [
  { name: 'Emergency Fund', target: 300000, saved: 145000, emoji: '🛡️', color: 'emerald', deadline: 'Dec 2025', aiDate: 'Nov 2025' },
  { name: 'Goa Vacation', target: 50000, saved: 32000, emoji: '✈️', color: 'blue', deadline: 'Mar 2026', aiDate: 'Feb 2026' },
  { name: 'MacBook Pro', target: 180000, saved: 75000, emoji: '💻', color: 'slate', deadline: 'Jun 2026', aiDate: 'May 2026' },
  { name: 'New Car', target: 800000, saved: 120000, emoji: '🚗', color: 'amber', deadline: 'Jan 2027', aiDate: 'Mar 2027' },
]

export const bills = [
  { name: 'Rent', amount: 25000, due: 'Jul 25', status: 'upcoming', emoji: '🏠', recurring: true },
  { name: 'Electricity', amount: 1850, due: 'Jul 20', status: 'due-soon', emoji: '⚡', recurring: true },
  { name: 'Internet', amount: 1499, due: 'Jul 19', status: 'due-today', emoji: '📶', recurring: true },
  { name: 'Gym', amount: 2500, due: 'Aug 1', status: 'upcoming', emoji: '💪', recurring: true },
  { name: 'Netflix', amount: 649, due: 'Jul 28', status: 'upcoming', emoji: '🎬', recurring: true },
  { name: 'Credit Card', amount: 18500, due: 'Jul 15', status: 'paid', emoji: '💳', recurring: false },
]

export const knowledgeArticles = [
  {
    title: 'Understanding Income Tax Slabs & Deductions (FY 2024-25)',
    category: 'Tax',
    summary: 'Compare New vs Old Tax Regime, Section 80C (₹1.5L), 80D medical insurance, and 80CCD(1B) additional NPS benefits to minimize tax liability.',
    readTime: '5 min',
    color: 'blue',
    source: 'Income Tax Department & Open Tax Data',
  },
  {
    title: 'RBI Monetary Policy & Repo Rate Analysis',
    category: 'RBI',
    summary: 'How Reserve Bank of India policy rates influence home loan EMIs, fixed deposit interest rates, and inflation targets.',
    readTime: '7 min',
    color: 'emerald',
    source: 'RBI Official Circulars',
  },
  {
    title: 'Nifty 50 & Market Index SIP Strategies (yFinance Insights)',
    category: 'Investments',
    summary: 'Historical market performance analysis showing rupee-cost averaging returns in Nifty 50 Index funds over 10-year rolling horizons.',
    readTime: '6 min',
    color: 'purple',
    source: 'Open Market Data & yFinance Index Feeds',
  },
  {
    title: 'Government Schemes: Sovereign Gold Bond (SGB) & PPF',
    category: 'Government Schemes',
    summary: 'Earn 2.5% fixed annual interest plus capital gains tax exemption on maturity with SGBs, and 7.1% tax-free returns with PPF.',
    readTime: '4 min',
    color: 'amber',
    source: 'Ministry of Finance & RBI',
  },
  {
    title: 'Term Life Insurance vs ULIP: Comprehensive Breakdown',
    category: 'Insurance',
    summary: 'Why pure term insurance combined with low-cost index funds outperforms traditional unit-linked insurance plans for 95% of investors.',
    readTime: '8 min',
    color: 'red',
    source: 'IRDAI & SEBI Investor Education',
  },
  {
    title: 'How High-Yield Savings & Liquid Funds Maximize Returns',
    category: 'Banking',
    summary: 'Compare sweep-in savings accounts, liquid mutual funds, and DICGC ₹5 Lakh deposit insurance coverage.',
    readTime: '4 min',
    color: 'slate',
    source: 'DICGC & Open Banking Data',
  },
  {
    title: 'SEBI Categorization of Mutual Funds: Small Cap, Mid Cap & Flexi-Cap',
    category: 'Investments',
    summary: 'Understanding SEBI mandate requiring 65% allocation for market cap funds and risk-adjusted return expectations.',
    readTime: '6 min',
    color: 'purple',
    source: 'SEBI Regulations',
  },
]
