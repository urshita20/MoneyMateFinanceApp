import { useState, useEffect } from 'react'
import juniorStore, { JuniorData } from '../../services/juniorStore'

const rarityColors: Record<string, string> = {
  Common: 'bg-slate-100 text-slate-600',
  Uncommon: 'bg-sky-100 text-sky-700',
  Rare: 'bg-violet-100 text-violet-700',
  Epic: 'bg-amber-100 text-amber-700',
  Legendary: 'bg-rose-100 text-rose-700',
}

export default function JuniorStreaks() {
  const [data, setData] = useState<JuniorData>(juniorStore.getData())

  useEffect(() => {
    const unsub = juniorStore.subscribe(() => {
      setData(juniorStore.getData())
    })
    return unsub
  }, [])

  const earned = data.badges.filter(b => b.earned)
  const locked = data.badges.filter(b => !b.earned)

  const currentLevel = Math.floor(data.profile.xp / 100) + 1
  const levelXpProgress = data.profile.xp % 100
  const xpToNextLevel = 100 - levelXpProgress

  const streaksList = [
    { label: 'Saving Streak', value: data.streaks.savingStreak, unit: 'days', emoji: '🔥', color: 'bg-amber-50 border-amber-200 text-amber-600' },
    { label: 'Quest Streak', value: data.streaks.questStreak, unit: 'days', emoji: '⚡', color: 'bg-sky-50 border-sky-200 text-sky-600' },
    { label: 'Budget Wins', value: data.streaks.budgetWins, unit: 'months', emoji: '🏆', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
    { label: 'Give & Grow', value: data.streaks.giveStreak, unit: 'weeks', emoji: '🌱', color: 'bg-violet-50 border-violet-200 text-violet-600' },
  ]

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Badges & Streaks 🏅</h1>
        <p className="text-sm text-slate-400 mt-0.5">Celebrate your savings wins and build lasting financial habits!</p>
      </div>

      {/* XP summary hero */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-5xl flex-shrink-0">
            ⭐
          </div>
          <div className="flex-1 text-center md:text-left">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">Total XP Earned</p>
            <p className="text-4xl font-black mb-1">{data.profile.xp} XP</p>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden w-full max-w-xs mx-auto md:mx-0">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-700"
                style={{ width: `${levelXpProgress}%` }}
              />
            </div>
            <p className="text-xs text-violet-200 mt-1.5">{xpToNextLevel} XP to Level {currentLevel + 1}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center w-full md:w-auto">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
              <p className="text-2xl font-black">{earned.length}</p>
              <p className="text-xs text-violet-200">Badges</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3">
              <p className="text-2xl font-black">Level {currentLevel}</p>
              <p className="text-xs text-violet-200">Current</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">🔥 Active Financial Streaks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {streaksList.map(s => (
            <div key={s.label} className={`${s.color} border rounded-3xl p-4 text-center shadow-sm`}>
              <span className="text-3xl block mb-2">{s.emoji}</span>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.unit}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earned badges */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">🏅 Earned Badges ({earned.length})</h2>
        {earned.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            <span className="text-3xl block mb-2">🎯</span>
            No badges unlocked yet! Complete your first quest or save ₹100 into a dream goal to earn your first badge.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {earned.map(badge => (
              <div key={badge.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all text-center group">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {badge.emoji}
                </div>
                <p className="text-xs font-bold text-slate-900 mb-1 leading-tight">{badge.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rarityColors[badge.rarity] || 'bg-slate-100'}`}>
                  {badge.rarity}
                </span>
                {badge.date && <p className="text-[10px] text-slate-400 mt-2">Unlocked {badge.date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Locked badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-slate-700 mb-3">🔒 Badges to Unlock ({locked.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {locked.map(badge => (
              <div key={badge.id} className="bg-slate-50 rounded-3xl border border-slate-200 p-4 text-center opacity-70">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl mx-auto mb-3 grayscale">
                  {badge.emoji}
                </div>
                <p className="text-xs font-bold text-slate-500 mb-1 leading-tight">{badge.title}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${rarityColors[badge.rarity] || 'bg-slate-100'}`}>
                  {badge.rarity}
                </span>
                {badge.hint && <p className="text-[10px] text-slate-400 mt-2">{badge.hint}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

