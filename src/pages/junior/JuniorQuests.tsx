import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Star, Trophy, Plus, Shield, X, Check, ThumbsDown } from 'lucide-react'
import juniorStore, { JuniorData, Quest } from '../../services/juniorStore'

const statusConfig = {
  pending: { label: 'To Do', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },
  awaiting: { label: 'Awaiting Approval', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  approved: { label: 'Completed ✓', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
}

export default function JuniorQuests() {
  const [data, setData] = useState<JuniorData>(juniorStore.getData())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showApprovalPinModal, setShowApprovalPinModal] = useState(false)
  const [selectedAwaitingQuest, setSelectedAwaitingQuest] = useState<Quest | null>(null)

  const [parentPinInput, setParentPinInput] = useState('')
  const [pinError, setPinError] = useState('')

  // New Quest Form
  const [newQuest, setNewQuest] = useState({
    title: '',
    desc: '',
    reward: 50,
    xp: 20,
    emoji: '🧹',
    daysLeft: 1,
  })

  useEffect(() => {
    const unsub = juniorStore.subscribe(() => {
      setData(juniorStore.getData())
    })
    return unsub
  }, [])

  const handleMarkComplete = (id: string | number) => {
    juniorStore.markQuestComplete(id)
  }

  const handleOpenApproveModal = (quest: Quest) => {
    setSelectedAwaitingQuest(quest)
    setParentPinInput('')
    setPinError('')
    setShowApprovalPinModal(true)
  }

  const handleApproveWithPin = () => {
    if (!selectedAwaitingQuest) return
    if (juniorStore.verifyParentPin(parentPinInput)) {
      juniorStore.approveQuest(selectedAwaitingQuest.id)
      setShowApprovalPinModal(false)
      setSelectedAwaitingQuest(null)
      setParentPinInput('')
      setPinError('')
    } else {
      setPinError('Incorrect Parent PIN. Try again.')
    }
  }

  const handleCreateQuest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuest.title.trim()) return

    juniorStore.addQuest({
      title: newQuest.title.trim(),
      desc: newQuest.desc.trim() || 'Complete this quest for reward',
      reward: Number(newQuest.reward) || 20,
      xp: Number(newQuest.xp) || 10,
      emoji: newQuest.emoji,
      daysLeft: Number(newQuest.daysLeft) || 1,
    })

    setShowCreateModal(false)
    setNewQuest({ title: '', desc: '', reward: 50, xp: 20, emoji: '🧹', daysLeft: 1 })
  }

  const totalEarned = data.quests.filter(q => q.status === 'approved').reduce((s, q) => s + q.reward, 0)
  const totalXP = data.quests.filter(q => q.status === 'approved').reduce((s, q) => s + q.xp, 0)
  const pendingCount = data.quests.filter(q => q.status === 'pending').length
  const awaitingCount = data.quests.filter(q => q.status === 'awaiting').length

  const groups: { label: string; filter: 'pending' | 'awaiting' | 'approved'; quests: Quest[] }[] = [
    { label: '⚡ Active Quests', filter: 'pending', quests: data.quests.filter(q => q.status === 'pending') },
    { label: '⏳ Awaiting Parent Approval', filter: 'awaiting', quests: data.quests.filter(q => q.status === 'awaiting') },
    { label: '✅ Completed & Rewarded', filter: 'approved', quests: data.quests.filter(q => q.status === 'approved') },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quests & Chores 🗡️</h1>
          <p className="text-sm text-slate-400 mt-0.5">Complete chores to earn allowance coins and XP!</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-2xl transition-colors shadow-sm shadow-sky-500/20"
        >
          <Plus size={15} /> Create Custom Quest
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Coins Earned', value: `₹${totalEarned.toLocaleString()}`, emoji: '🪙', bg: 'bg-amber-50 border-amber-200' },
          { label: 'XP Earned', value: `${data.profile.xp} XP`, emoji: '⭐', bg: 'bg-violet-50 border-violet-200' },
          { label: 'Active', value: String(pendingCount), emoji: '📋', bg: 'bg-sky-50 border-sky-200' },
          { label: 'Pending Review', value: String(awaitingCount), emoji: '⏳', bg: 'bg-amber-50 border-amber-200' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
            <span className="text-2xl block mb-1">{s.emoji}</span>
            <p className="text-lg font-black text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Parent Approval Banner Notice if awaiting */}
      {awaitingCount > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔑</span>
            <div>
              <p className="text-xs font-bold text-amber-900">{awaitingCount} quest(s) waiting for Parent Approval</p>
              <p className="text-[11px] text-amber-700">Parents can enter their Parent PIN to review and credit coins & XP to Spend Jar.</p>
            </div>
          </div>
        </div>
      )}

      {/* Quest groups */}
      {groups.map(group => (
        <div key={group.filter}>
          <h2 className="text-sm font-bold text-slate-700 mb-3">{group.label} ({group.quests.length})</h2>
          {group.quests.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400">
              No quests in this category
            </div>
          ) : (
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
                        <div className="flex flex-wrap items-center gap-3 mt-3">
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
                              onClick={() => handleMarkComplete(quest.id)}
                              className="ml-auto flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
                            >
                              <CheckCircle size={12} />
                              Mark Done
                            </button>
                          )}

                          {quest.status === 'awaiting' && (
                            <button
                              onClick={() => handleOpenApproveModal(quest)}
                              className="ml-auto flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3.5 py-1.5 rounded-xl transition-colors shadow-sm"
                            >
                              <Shield size={12} />
                              Parent Approve Reward
                            </button>
                          )}

                          {quest.status === 'approved' && (
                            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                              <Trophy size={12} />
                              Reward Credited!
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}

      {/* Parent PIN Approval Modal */}
      {showApprovalPinModal && selectedAwaitingQuest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Shield className="text-amber-500" size={18} />
                <h3 className="font-bold text-slate-900 text-sm">Parent Verification Required</h3>
              </div>
              <button onClick={() => setShowApprovalPinModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-amber-900">{selectedAwaitingQuest.title}</p>
              <p className="text-[11px] text-amber-700">
                Reward: <strong>₹{selectedAwaitingQuest.reward}</strong> + <strong>{selectedAwaitingQuest.xp} XP</strong>
              </p>
            </div>

            {pinError && (
              <p className="text-xs font-semibold text-rose-600">{pinError}</p>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Enter Parent 4-Digit PIN</label>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="• • • •"
                value={parentPinInput}
                onChange={e => setParentPinInput(e.target.value)}
                className="w-full px-3 py-2 text-base text-center tracking-widest font-bold border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowApprovalPinModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveWithPin}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
              >
                <Check size={14} /> Approve & Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Quest Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Create Quest for Child 🎯</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateQuest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Quest Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read for 30 minutes 📖"
                  value={newQuest.title}
                  onChange={e => setNewQuest({ ...newQuest, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="Details or instructions..."
                  value={newQuest.desc}
                  onChange={e => setNewQuest({ ...newQuest, desc: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Reward (₹)</label>
                  <input
                    type="number"
                    min={5}
                    value={newQuest.reward}
                    onChange={e => setNewQuest({ ...newQuest, reward: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">XP Reward</label>
                  <input
                    type="number"
                    min={5}
                    value={newQuest.xp}
                    onChange={e => setNewQuest({ ...newQuest, xp: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {['🧹', '📐', '🌱', '📖', '🛒', '🎸', '⚽', '🎨', '🐶', '🍽️'].map(e => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setNewQuest({ ...newQuest, emoji: e })}
                      className={`text-xl p-1.5 rounded-xl ${newQuest.emoji === e ? 'bg-sky-100 ring-2 ring-sky-400' : 'hover:bg-slate-100'}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl transition-colors text-sm shadow-md shadow-sky-500/20"
              >
                Add Quest to Board 🚀
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

