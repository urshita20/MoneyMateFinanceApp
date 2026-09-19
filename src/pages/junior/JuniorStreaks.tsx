const badges = [
  { id: 1, emoji: '🔥', title: '3-Week Savings Streak', desc: 'Saved money every week for 3 weeks straight', earned: true, date: 'Sep 15', color: 'amber', rarity: 'Rare' },
  { id: 2, emoji: '🏆', title: 'Budget Hero', desc: 'Stayed within all spending limits for a full month', earned: true, date: 'Sep 1', color: 'yellow', rarity: 'Epic' },
  { id: 3, emoji: '💰', title: 'First ₹100 Locked', desc: 'Locked your first ₹100 into the savings vault', earned: true, date: 'Aug 20', color: 'emerald', rarity: 'Common' },
  { id: 4, emoji: '🎯', title: 'Goal Crusher', desc: 'Reached 100% on your first Dream Goal', earned: true, date: 'Aug 12', color: 'sky', rarity: 'Uncommon' },
  { id: 5, emoji: '🧠', title: 'Smart Spender', desc: 'Used the Buy Simulator 5 times before purchasing', earned: true, date: 'Aug 5', color: 'violet', rarity: 'Uncommon' },
  { id: 6, emoji: '⭐', title: 'Quest Master', desc: 'Completed 20 quests total', earned: true, date: 'Jul 28', color: 'indigo', rarity: 'Rare' },
  { id: 7, emoji: '🌱', title: 'Give & Grow', desc: 'Put money in the Give & Grow jar 4 weeks in a row', earned: true, date: 'Jul 15', color: 'green', rarity: 'Uncommon' },
  { id: 8, emoji: '🚀', title: 'First Investor', desc: 'Learn what investing means and complete the quiz', earned: false, color: 'slate', rarity: 'Epic', hint: 'Complete the Investment Quest to unlock' },
  { id: 9, emoji: '💎', title: 'Diamond Saver', desc: 'Save ₹5,000 total across all goals', earned: false, color: 'slate', rarity: 'Legendary', hint: `₹3,160 more to go!` },
  { id: 10, emoji: '🎓', title: 'Money Graduate', desc: 'Complete all 5 financial literacy modules', earned: false, color: 'slate', rarity: 'Epic', hint: '2 of 5 modules done' },
]

const streaks = [
  { label: 'Saving Streak', value: 21, unit: 'days', emoji: '🔥', color: 'bg-amber-50 border-amber-200 text-amber-600' },
  { label: 'Quest Streak', value: 12, unit: 'days', emoji: '⚡', color: 'bg-sky-50 border-sky-200 text-sky-600' },
  { label: 'Budget Wins', value: 2, unit: 'months', emoji: '🏆', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  { label: 'Give & Grow', value: 4, unit: 'weeks', emoji: '🌱', color: 'bg-violet-50 border-violet-200 text-violet-600' },
]

const rarityColors: Record<string, string> = {
  Common: 'bg-slate-100 text-slate-600',
  Uncommon: 'bg-sky-100 text-sky-700',
  Rare: 'bg-violet-100 text-violet-700',
  Epic: 'bg-amber-100 text-amber-700',
  Legendary: 'bg-rose-100 text-rose-700',
}

export default function JuniorStreaks() {
  const earned = badges.filter(b => b.earned)
  const locked = badges.filter(b => !b.earned)

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Badges & Streaks 🏅</h1>
        <p className="text-sm text-slate-400 mt-0.5">Celebrate your wins and keep the momentum going!</p>
      </div>

      {/* XP summary hero */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-white/15 border-2 border-white/30 flex items-center justify-center text-5xl flex-shrink-0">
            ⭐
          </div>
          <div className="flex-1">
            <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">Total XP Earned</p>
            <p className="text-4xl font-black mb-1">240 XP</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden w-48">
              <div className="h-full bg-amber-400 rounded-full" style={{ width: '60%' }} />
            </div>
            <p className="text-xs text-violet-200 mt-1">160 XP to next level (Level 4)</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <p className="text-2xl font-black">{earned.length}</p>
              <p className="text-xs text-violet-200">Badges</p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
              <p className="text-2xl font-black">Level 3</p>
              <p className="text-xs text-violet-200">Current</p>
            </div>
          </div>
        </div>
      </div>

      {/* Streaks */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">🔥 Active Streaks</h2>
        <div className="grid grid-cols-4 gap-3">
          {streaks.map(s => (
            <div key={s.label} className={`${s.color} border rounded-3xl p-4 text-center`}>
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
        <div className="grid grid-cols-4 gap-3">
          {earned.map(badge => (
            <div key={badge.id} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl mx-auto mb-3 group-hover:scale-110 transition-transform">
                {badge.emoji}
              </div>
              <p className="text-xs font-bold text-slate-900 mb-1 leading-tight">{badge.title}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rarityColors[badge.rarity]}`}>
                {badge.rarity}
              </span>
              <p className="text-xs text-slate-400 mt-2">{badge.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Locked badges */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-3">🔒 Badges to Unlock ({locked.length})</h2>
        <div className="grid grid-cols-4 gap-3">
          {locked.map(badge => (
            <div key={badge.id} className="bg-slate-50 rounded-3xl border border-slate-200 p-4 text-center opacity-70">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-4xl mx-auto mb-3 grayscale">
                {badge.emoji}
              </div>
              <p className="text-xs font-bold text-slate-500 mb-1 leading-tight">{badge.title}</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${rarityColors[badge.rarity]}`}>
                {badge.rarity}
              </span>
              {badge.hint && <p className="text-xs text-slate-400 mt-2">{badge.hint}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
