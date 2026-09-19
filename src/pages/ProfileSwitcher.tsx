import { useState } from 'react'
import { TrendingUp, Lock, Users, ArrowRight, Star } from 'lucide-react'
import type { Page } from '../types'
import { api } from '../services/api'

interface ProfileSwitcherProps {
  onNav: (p: Page) => void
  user?: any
}

export default function ProfileSwitcher({ onNav, user }: ProfileSwitcherProps) {
  const [hoveredProfile, setHoveredProfile] = useState<'adult' | 'junior' | null>(null)
  const [pinModal, setPinModal] = useState(false)
  const [pin, setPin] = useState('')

  const adultName = user?.name || 'Urshita Madaan'
  const adultInitial = adultName.charAt(0).toUpperCase()

  const enterAdult = async () => {
    try {
      await api.auth.switchProfile('adult')
    } catch (e) {
      // ignore
    }
    setPinModal(true)
  }

  const enterJunior = async () => {
    try {
      await api.auth.switchProfile('junior')
    } catch (e) {
      // ignore
    }
    onNav('junior-dashboard')
  }

  const submitPin = () => {
    setPinModal(false)
    setPin('')
    onNav('dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-16">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TrendingUp size={18} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-white tracking-tight">Finshpere</span>
      </div>

      {/* Heading */}
      <h1 className="text-3xl font-bold text-white mb-2 text-center">Who's managing money today?</h1>
      <p className="text-slate-400 text-sm mb-12 text-center">Choose your profile to get started</p>

      {/* Profile cards */}
      <div className="flex gap-6 mb-10">
        {/* Adult profile */}
        <button
          onClick={enterAdult}
          onMouseEnter={() => setHoveredProfile('adult')}
          onMouseLeave={() => setHoveredProfile(null)}
          className={`group flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-200 w-52 ${
            hoveredProfile === 'adult'
              ? 'bg-slate-800 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              {adultInitial}
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-sm">
              <Lock size={12} className="text-white" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-base">{adultName}</p>
            <p className="text-slate-400 text-xs mt-0.5">Primary Adult Account</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs font-semibold text-emerald-400">Finshpere Adult Pro</p>
          </div>

          <div className={`flex items-center gap-1.5 text-xs transition-colors ${hoveredProfile === 'adult' ? 'text-emerald-400' : 'text-slate-500'}`}>
            Enter workspace <ArrowRight size={12} />
          </div>
        </button>

        {/* Divider */}
        <div className="flex items-center">
          <div className="h-px w-8 bg-slate-800" />
          <span className="text-slate-700 text-xs px-2">or</span>
          <div className="h-px w-8 bg-slate-800" />
        </div>

        {/* Junior profile */}
        <button
          onClick={enterJunior}
          onMouseEnter={() => setHoveredProfile('junior')}
          onMouseLeave={() => setHoveredProfile(null)}
          className={`group flex flex-col items-center gap-4 p-6 rounded-3xl border transition-all duration-200 w-52 ${
            hoveredProfile === 'junior'
              ? 'bg-slate-800 border-sky-500/40 shadow-xl shadow-sky-500/10'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-sky-400 to-violet-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
              K
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
              <Star size={11} className="text-white fill-white" />
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-semibold text-base">Kids Saver</p>
            <p className="text-slate-400 text-xs mt-0.5">Junior Saver Profile</p>
          </div>

          <div className="px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
            <p className="text-xs font-semibold text-sky-400">Finshpere Junior</p>
          </div>

          <div className={`flex items-center gap-1.5 text-xs transition-colors ${hoveredProfile === 'junior' ? 'text-sky-400' : 'text-slate-500'}`}>
            Enter workspace <ArrowRight size={12} />
          </div>
        </button>
      </div>

      {/* Manage accounts */}
      <button onClick={() => onNav('settings')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors border border-slate-800 hover:border-slate-700 px-5 py-2.5 rounded-xl">
        <Users size={14} />
        Manage Family Accounts
      </button>

      {/* PIN Modal */}
      {pinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-80 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-amber-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-1">Enter PIN</h2>
            <p className="text-slate-400 text-sm mb-6">Workspace is PIN-protected (press any 4 numbers)</p>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    pin.length > i ? 'bg-emerald-400 border-emerald-400' : 'border-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((k, idx) => (
                <button
                  key={idx}
                  disabled={k === null}
                  onClick={() => {
                    if (k === 'del') setPin(p => p.slice(0, -1))
                    else if (k !== null && pin.length < 4) {
                      const next = pin + String(k)
                      setPin(next)
                      if (next.length === 4) setTimeout(submitPin, 300)
                    }
                  }}
                  className={`h-12 rounded-xl text-sm font-semibold transition-colors ${
                    k === null
                      ? 'invisible'
                      : k === 'del'
                      ? 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      : 'bg-slate-800 text-white hover:bg-slate-700'
                  }`}
                >
                  {k === 'del' ? '⌫' : k}
                </button>
              ))}
            </div>
            <button onClick={() => { setPinModal(false); setPin('') }} className="text-xs text-slate-500 hover:text-slate-400">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
