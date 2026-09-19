import {
  LayoutDashboard, ArrowLeftRight, PieChart, Sparkles, Target, Calendar,
  Scan, MessageSquare, BookOpen, Settings, TrendingUp, Heart, LogOut,
  CreditCard, BarChart2, Globe, Wallet, Activity, Lightbulb,
  Clock, Shield, Users,
} from 'lucide-react'
import type { Page } from '../types'

const sections = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard',     page: 'dashboard' as Page },
      { icon: ArrowLeftRight,  label: 'Transactions',  page: 'transactions' as Page },
      { icon: PieChart,        label: 'Budget',         page: 'budget' as Page },
      { icon: Target,          label: 'Goals',          page: 'goals' as Page },
      { icon: Calendar,        label: 'Bills',          page: 'bills' as Page },
    ],
  },
  {
    label: 'Finance',
    items: [
      { icon: CreditCard,  label: 'Loans',            page: 'loans' as Page },
      { icon: Wallet,      label: 'Net Worth',         page: 'networth' as Page },
      { icon: Heart,       label: 'Health Score',      page: 'financial-health' as Page },
    ],
  },
  {
    label: 'Planning',
    items: [
      { icon: Clock,   label: 'Time Machine',    page: 'time-machine' as Page },
      { icon: Shield,  label: 'Safety Net',      page: 'safety-net' as Page },
    ],
  },
  {
    label: 'Invest',
    items: [
      { icon: BarChart2,   label: 'Portfolio',         page: 'portfolio' as Page },
      { icon: Globe,       label: 'Market',            page: 'market' as Page },
      { icon: Lightbulb,   label: 'Invest Ideas',      page: 'investments' as Page },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { icon: Sparkles,       label: 'AI Insights',   page: 'ai-dashboard' as Page },
      { icon: Activity,       label: 'Analytics',      page: 'insights' as Page },
      { icon: MessageSquare,  label: 'AI Assistant',   page: 'chat' as Page },
      { icon: Scan,           label: 'OCR Scanner',    page: 'ocr' as Page },
    ],
  },
  {
    label: 'More',
    items: [
      { icon: BookOpen, label: 'Knowledge Hub', page: 'knowledge' as Page },
      { icon: Settings, label: 'Settings',       page: 'settings' as Page },
    ],
  },
]

interface SidebarProps {
  currentPage: Page
  onNav: (p: Page) => void
}

export default function Sidebar({ currentPage, onNav }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800">
        <button onClick={() => onNav('dashboard')} className="flex items-center gap-3 w-full">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
            <TrendingUp size={16} className="text-white" />
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight">Finshpere</p>
            <p className="text-xs text-emerald-500 font-medium">Finance Copilot</p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-4">
        {sections.map(section => (
          <div key={section.label}>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider px-3 pb-1">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => {
                const active = currentPage === item.page
                return (
                  <button
                    key={item.page}
                    onClick={() => onNav(item.page)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                      active
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon
                      size={15}
                      className={active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}
                    />
                    {item.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Switch to Junior + User profile */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          onClick={() => onNav('profile-switcher')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors border border-sky-200 dark:border-sky-800/40"
        >
          <Users size={14} className="text-sky-500" />
          Switch to Junior Profile
          <span className="ml-auto text-xs bg-sky-200 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 px-1.5 py-0.5 rounded-full font-semibold">Leo</span>
        </button>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">Arjun Sharma</p>
            <p className="text-xs text-slate-400 truncate">arjun@gmail.com</p>
          </div>
          <LogOut size={14} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
