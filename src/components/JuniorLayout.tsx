import { ReactNode } from 'react'
import {
  LayoutDashboard, Target, CheckSquare, ShoppingCart, Award,
  ArrowLeftRight, Star,
} from 'lucide-react'
import type { Page } from '../types'

const navItems = [
  { icon: LayoutDashboard, label: 'My Dashboard',    page: 'junior-dashboard' as Page },
  { icon: Target,          label: 'My Wishlist',     page: 'junior-goals' as Page },
  { icon: CheckSquare,     label: 'Quests & Chores', page: 'junior-quests' as Page },
  { icon: ShoppingCart,    label: 'Buy Simulator',   page: 'junior-buy-sim' as Page },
  { icon: Award,           label: 'My Badges',       page: 'junior-streaks' as Page },
]

interface JuniorLayoutProps {
  page: Page
  onNav: (p: Page) => void
  children: ReactNode
}

export default function JuniorLayout({ page, onNav, children }: JuniorLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-20">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <button onClick={() => onNav('junior-dashboard')} className="flex items-center gap-3 w-full">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-sm">
              <Star size={16} className="text-white fill-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 text-sm leading-tight">Finshpere Junior</p>
              <p className="text-xs text-sky-500 font-medium">Learn. Save. Grow.</p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const active = page === item.page
            return (
              <button
                key={item.page}
                onClick={() => onNav(item.page)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-sky-50 text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  active ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30' : 'bg-slate-100 text-slate-400'
                }`}>
                  <item.icon size={14} />
                </div>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-500" />}
              </button>
            )
          })}
        </nav>

        {/* Profile + Switch */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-sky-50">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              L
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">Leo</p>
              <p className="text-xs text-sky-500 font-medium">Junior Saver ⭐</p>
            </div>
          </div>
          <button
            onClick={() => onNav('profile-switcher')}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors"
          >
            <ArrowLeftRight size={12} />
            Switch to Parent Account
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-10">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Hey Leo! 👋</p>
            <p className="text-xs text-slate-400">Keep up the great saving streak!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-amber-600">12 Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-bold text-violet-600">240 XP</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
