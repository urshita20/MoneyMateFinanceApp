import { ReactNode, useState, useEffect } from 'react'
import {
  LayoutDashboard, Target, CheckSquare, ShoppingCart, Award,
  ArrowLeftRight, Star, Lock, X, Check, ShieldAlert,
} from 'lucide-react'
import type { Page } from '../types'
import { juniorStore, type JuniorProfileData } from '../services/juniorStore'

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
  const [juniorData, setJuniorData] = useState<JuniorProfileData | null>(null)
  const [showPinModal, setShowPinModal] = useState(false)
  const [enteredPin, setEnteredPin] = useState('')
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    setJuniorData(juniorStore.getData())
  }, [page])

  const handleVerifyPinAndSwitch = (e: React.FormEvent) => {
    e.preventDefault()
    setPinError('')
    if (juniorStore.verifyParentPin(enteredPin)) {
      setShowPinModal(false)
      setEnteredPin('')
      onNav('dashboard')
    } else {
      setPinError('Incorrect Parent PIN. Please try again.')
    }
  }

  const childName = juniorData?.childName || 'Junior Saver'
  const initialLetter = childName.charAt(0).toUpperCase()
  const streak = juniorData?.streakDays || 1
  const xp = juniorData?.xp || 0

  return (
    <div className="min-h-screen bg-slate-100" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-20">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <button onClick={() => onNav('junior-dashboard')} className="flex items-center gap-3 w-full text-left">
            <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-violet-500 rounded-2xl flex items-center justify-center shadow-sm">
              <Star size={16} className="text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm leading-tight">MoneyMate Junior</p>
              <p className="text-xs text-sky-500 font-medium">Learn. Save. Grow.</p>
            </div>
          </button>
        </div>

        {/* Nav items */}
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

        {/* Profile + Switch to Parent */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-sky-50">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {initialLetter}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{childName}</p>
              <p className="text-xs text-sky-500 font-medium">Junior Saver ⭐</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEnteredPin('')
              setPinError('')
              setShowPinModal(true)
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl transition-colors bg-white shadow-xs"
          >
            <Lock size={12} className="text-slate-500" />
            Switch to Parent Account
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <div className="ml-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 gap-4 sticky top-0 z-10">
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900">Hey {childName}! 👋</p>
            <p className="text-xs text-slate-400">Keep up the great financial saving habits!</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full">
              <span className="text-sm">🔥</span>
              <span className="text-xs font-bold text-amber-600">{streak} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-full">
              <span className="text-sm">⭐</span>
              <span className="text-xs font-bold text-violet-600">{xp} XP</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Parent PIN Security Verification Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 relative">
            <button
              onClick={() => setShowPinModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto text-sky-600">
                <Lock size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900">Parent Access Verification</h3>
              <p className="text-xs text-slate-500">
                Enter your 4-digit Parent PIN to switch back to the parent account.
              </p>
            </div>

            <form onSubmit={handleVerifyPinAndSwitch} className="space-y-4">
              {pinError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-xl flex items-center gap-1.5 justify-center">
                  <ShieldAlert size={14} />
                  {pinError}
                </div>
              )}

              <div>
                <input
                  type="password"
                  maxLength={6}
                  value={enteredPin}
                  onChange={e => setEnteredPin(e.target.value)}
                  placeholder="Enter Parent PIN"
                  autoFocus
                  className="w-full text-center text-lg font-mono tracking-widest bg-slate-50 border border-slate-200 rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-slate-900"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-sm"
                >
                  Verify & Switch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
