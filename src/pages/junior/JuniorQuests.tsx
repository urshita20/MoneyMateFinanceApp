import { useState } from 'react'
import { CheckCircle, Clock, Star, Trophy } from 'lucide-react'

type QuestStatus = 'pending' | 'awaiting' | 'approved'

interface Quest {
  id: number
  title: string
  desc: string
  reward: number
  xp: number
  emoji: string
  status: QuestStatus
  daysLeft?: number
  streak?: number
}

const initialQuests: Quest[] = [
  { id: 1, title: 'Clean Bedroom', desc: 'Tidy up your room and make your bed', reward: 50, xp: 20, emoji: '🛏️', status: 'pending', daysLeft: 1 },
  { id: 2, title: 'Finish Math Homework', desc: 'Complete all 20 practice problems', reward: 80, xp: 35, emoji: '📐', status: 'pending', daysLeft: 2 },
  { id: 3, title: 'Water Plants for 5 Days', desc: 'Water the balcony plants every day', reward: 100, xp: 50, emoji: '🌱', status: 'awaiting', streak: 5 },
  { id: 4, title: 'Read for 30 Minutes', desc: 'Read any book of your choice', reward: 40, xp: 15, emoji: '📖', status: 'pending', daysLeft: 3 },
  { id: 5, title: 'Help with Groceries', desc: 'Help sort and pack the groceries', reward: 60, xp: 25, emoji: '🛒', status: 'approved' },
  { id: 6, title: 'Practice Guitar', desc: 'Play for at least 20 minutes', reward: 70, xp: 30, emoji: '🎸', status: 'approved' },
]

const statusConfig = {
  pending: { label: 'To Do', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  awaiting: { label: 'Awaiting Approval', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  approved: { label: 'Completed ✓', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
}

export default function JuniorQuests() {
  const [quests, setQuests] = useState(initialQuests)

  const markComplete = (id: number) => {
    setQuests(qs => qs.map(q => q.id === id ? { ...q, status: 'awaiting' } : q))
  }

  const totalEarned = quests.filter(q => q.status === 'approved').reduce((s, q) => s + q.reward, 0)
  const totalXP = quests.filter(q => q.status === 'approved').reduce((s, q) => s + q.xp, 0)
  const pending = quests.filter(q => q.status === 'pending').length
  const awaiting = quests.filter(q => q.status === 'awaiting').length

  const groups: { label: string; filter: QuestStatus; quests: Quest[] }[] = [
    { label: '⚡ Active Quests', filter: 'pending', quests: quests.filter(q => q.status === 'pending') },
    { label: '⏳ Awaiting Parent Approval', filter: 'awaiting', quests: quests.filter(q => q.status === 'awaiting') },
    { label: '✅ Completed', filter: 'approved', quests: quests.filter(q => q.status === 'approved') },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Quests & Chores 🗡️</h1>
        <p className="text-sm text-slate-400 mt-0.5">Complete quests to earn coins and XP!</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Coins Earned', value: `₹${totalEarned}`, emoji: '🪙', bg: 'bg-amber-50 border-amber-200' },
          { label: 'XP Earned', value: `${totalXP} XP`, emoji: '⭐', bg: 'bg-violet-50 border-violet-200' },
          { label: 'Active', value: String(pending), emoji: '📋', bg: 'bg-sky-50 border-sky-200' },
          { label: 'Pending Review', value: String(awaiting), emoji: '⏳', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <span className="text-2xl block mb-1">{s.emoji}</span>
            <p className="text-lg font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quest groups */}
      {groups.map(group => group.quests.length > 0 && (
        <div key={group.filter}>
          <h2 className="text-sm font-bold text-slate-700 mb-3">{group.label}</h2>
          <div className="space-y-3">
            {group.quests.map(quest => {
              const cfg = statusConfig[quest.status]
              return (
                <div
                  key={quest.id}
                  className={`bg-white rounded-2xl border ${cfg.border} p-4 shadow-sm transition-all`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl flex-shrink-0">
                      {quest.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{quest.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{quest.desc}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                          <span className="text-xs">🪙</span>
                          <span className="text-xs font-bold text-amber-600">₹{quest.reward}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-violet-50 border border-violet-200 px-2.5 py-1 rounded-full">
                          <Star size={10} className="text-violet-500" />
                          <span className="text-xs font-bold text-violet-600">{quest.xp} XP</span>
                        </div>
                        {quest.daysLeft !== undefined && (
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={11} />
                            {quest.daysLeft}d left
                          </div>
                        )}
                        {quest.streak && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                            🔥 {quest.streak}-day streak!
                          </div>
                        )}
                        {quest.status === 'pending' && (
                          <button
                            onClick={() => markComplete(quest.id)}
                            className="ml-auto flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors"
                          >
                            <CheckCircle size={12} />
                            Mark Complete
                          </button>
                        )}
                        {quest.status === 'awaiting' && (
                          <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 font-semibold">
                            <Clock size={12} />
                            Waiting for parent...
                          </div>
                        )}
                        {quest.status === 'approved' && (
                          <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <Trophy size={12} />
                            Coins deposited!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
