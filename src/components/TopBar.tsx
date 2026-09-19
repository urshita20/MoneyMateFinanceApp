import { Search, Bell, Moon, Sun, Plus, ChevronDown } from 'lucide-react'
import type { Page } from '../types'

interface TopBarProps {
  onNav: (p: Page) => void
  dark: boolean
  onToggleDark: () => void
  user?: any
}

export default function TopBar({ onNav, dark, onToggleDark, user }: TopBarProps) {
  const name = user?.name || 'Urshita'
  const initial = name.charAt(0).toUpperCase()

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search transactions, insights..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 dark:focus:border-emerald-600 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNav('add-expense')}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm shadow-emerald-500/20"
        >
          <Plus size={14} />
          Add Expense
        </button>

        {/* Notifications */}
        <button
          onClick={() => onNav('insights')}
          className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
          title="Notifications & Bill Reminders"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {/* Dark mode */}
        <button
          onClick={onToggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Profile switcher */}
        <button
          onClick={() => onNav('profile-switcher')}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
            {initial}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{name}</span>
          <ChevronDown size={13} className="text-slate-400" />
        </button>
      </div>
    </header>
  )
}
