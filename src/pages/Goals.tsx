import { useState, useEffect } from 'react'
import { Plus, Target, Calendar, TrendingUp, Trash2, ArrowUpRight } from 'lucide-react'
import { api } from '../services/api'
import type { Page } from '../types'

function CircleProgress({ pct, color }: { pct: number; color: string }) {
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" className="dark:stroke-slate-800" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${c * (pct / 100)} ${c}`}
          strokeDashoffset={c * 0.25}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-slate-900 dark:text-white">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

export default function Goals() {
  const [goalsList, setGoalsList] = useState<any[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [loading, setLoading] = useState(true)

  // New goal form
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [savedAmount, setSavedAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [emoji, setEmoji] = useState('🎯')

  // Deposit state
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null)
  const [depositInput, setDepositInput] = useState('')

  const fetchGoals = () => {
    setLoading(true)
    api.goals.getAll()
      .then(res => {
        if (res.success && res.goals) {
          setGoalsList(res.goals)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  const handleCreateGoal = async () => {
    if (!name || !targetAmount) return

    try {
      await api.goals.create({
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || 'Dec 2026',
        emoji,
      })
      setShowAdd(false)
      setName('')
      setTargetAmount('')
      setSavedAmount('')
      setDeadline('')
      fetchGoals()
    } catch (err) {
      console.error('Error creating goal:', err)
    }
  }

  const handleDeposit = async (id: string) => {
    const val = parseFloat(depositInput)
    if (isNaN(val) || val <= 0) return

    try {
      await api.goals.deposit(id, val)
      setDepositGoalId(null)
      setDepositInput('')
      fetchGoals()
    } catch (err) {
      console.error('Error adding deposit to goal:', err)
    }
  }

  const handleDeleteGoal = async (id: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.goals.delete(id)
        fetchGoals()
      } catch (err) {
        console.error('Error deleting goal:', err)
      }
    }
  }

  const totalSaved = goalsList.reduce((acc, g) => acc + (g.savedAmount || 0), 0)
  const totalTarget = goalsList.reduce((acc, g) => acc + (g.targetAmount || 0), 0)

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Financial Goals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Track and save for your custom targets</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm px-4 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/25"
        >
          <Plus size={14} />
          Create Goal
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <TrendingUp size={20} className="text-emerald-500" />
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">₹{totalSaved.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400">Total Saved Across Goals</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <Target size={20} className="text-blue-500" />
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">₹{totalTarget.toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-400">Total Goals Target</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm flex items-center gap-3">
          <Calendar size={20} className="text-violet-500" />
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{goalsList.length}</p>
            <p className="text-xs text-slate-400">Active Custom Goals</p>
          </div>
        </div>
      </div>

      {/* Create Goal Form */}
      {showAdd && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Create New Financial Goal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Name</label>
              <input
                type="text"
                placeholder="e.g. Emergency Fund, Travel, Laptop"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount (₹)</label>
              <input
                type="number"
                placeholder="e.g. 50000"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
              <input
                type="text"
                placeholder="e.g. Dec 2026"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Emoji / Icon</label>
              <select
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="🎯">🎯 Target</option>
                <option value="🛡️">🛡️ Emergency</option>
                <option value="✈️">✈️ Vacation</option>
                <option value="💻">💻 Tech / Laptop</option>
                <option value="🚗">🚗 Vehicle</option>
                <option value="🏠">🏠 House</option>
                <option value="🎓">🎓 Education</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreateGoal}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
            >
              Create Goal
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goal Cards Grid */}
      {goalsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goalsList.map(goal => {
            const pct = Math.min(100, Math.round(((goal.savedAmount || 0) / goal.targetAmount) * 100))
            const remaining = Math.max(0, goal.targetAmount - (goal.savedAmount || 0))

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm hover:shadow-md transition-all relative group"
              >
                <button
                  onClick={() => handleDeleteGoal(goal.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition-colors"
                  title="Delete goal"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-3xl mb-2 block">{goal.emoji || '🎯'}</span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{goal.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Target Deadline: {goal.deadline}</p>
                  </div>
                  <CircleProgress pct={pct} color="#10B981" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Target</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{goal.targetAmount.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Saved</p>
                    <p className="text-sm font-bold text-emerald-600">₹{(goal.savedAmount || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">₹{remaining.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Deposit action */}
                {depositGoalId === goal.id ? (
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="number"
                      placeholder="Deposit amount (₹)"
                      value={depositInput}
                      onChange={e => setDepositInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleDeposit(goal.id)}
                      className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setDepositGoalId(null)}
                      className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setDepositGoalId(goal.id)
                      setDepositInput('')
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <ArrowUpRight size={14} className="text-emerald-500" />
                    + Add Savings Deposit
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center">
          <Target size={40} className="text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No financial goals created yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4 max-w-xs">
            Create custom savings goals for emergency funds, vacations, or tech purchases to track your progress.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-all shadow-sm"
          >
            <Plus size={14} />
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  )
}
