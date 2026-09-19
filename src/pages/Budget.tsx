import { useState, useEffect } from 'react'
import { AlertTriangle, Sparkles, CheckCircle, Plus, Edit2, Target } from 'lucide-react'
import { api } from '../services/api'
import type { Page } from '../types'

interface BudgetProps {
  onNav?: (p: Page) => void
}

export default function Budget({ onNav }: BudgetProps) {
  const [summary, setSummary] = useState<any>(null)
  const [categoryBudgets, setCategoryBudgets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBudgetCategory, setNewBudgetCategory] = useState('Food & Dining')
  const [newBudgetAmount, setNewBudgetAmount] = useState('')

  // Edit budget input state
  const [editOverallInput, setEditOverallInput] = useState('')
  const [isEditingOverall, setIsEditingOverall] = useState(false)

  const loadBudgets = () => {
    setLoading(true)
    Promise.all([
      api.analytics.getSummary(),
      api.budgets.getAll(),
    ])
      .then(([sumRes, budgetRes]) => {
        if (sumRes.success) setSummary(sumRes.summary)
        if (budgetRes.success && budgetRes.budgets) setCategoryBudgets(budgetRes.budgets)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBudgets()
  }, [])

  const handleSaveOverallBudget = async () => {
    const val = parseFloat(editOverallInput)
    if (isNaN(val) || val < 0) return

    try {
      await api.auth.setup({
        monthlyIncome: summary?.monthlyIncome || 0,
        monthlyBudget: val,
        savingsTarget: summary?.savingsTarget || 0,
      })
      setIsEditingOverall(false)
      loadBudgets()
    } catch (err) {
      console.error('Error saving budget:', err)
    }
  }

  const handleCreateCategoryBudget = async () => {
    const amount = parseFloat(newBudgetAmount)
    if (!amount || amount <= 0) return

    try {
      await api.budgets.create({
        category: newBudgetCategory,
        budgetAmount: amount,
      })
      setShowAddModal(false)
      setNewBudgetAmount('')
      loadBudgets()
    } catch (err) {
      console.error('Error creating category budget:', err)
    }
  }

  const monthlyBudget = summary?.monthlyBudget || 0
  const monthlyExpense = summary?.monthlyExpense || 0
  const remainingBudget = monthlyBudget - monthlyExpense
  const percentSpent = monthlyBudget > 0 ? Math.round((monthlyExpense / monthlyBudget) * 100) : 0

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Budget Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Real-time budget adherence & limits</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{monthlyExpense.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-500">
            {monthlyBudget > 0 ? `of ₹${monthlyBudget.toLocaleString('en-IN')} budget used` : 'No budget limit set'}
          </p>
        </div>
      </div>

      {/* Overall Budget Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="font-semibold text-slate-900 dark:text-white text-base">Monthly Spending Limit</span>
            <p className="text-xs text-slate-400 mt-0.5">Overall cap across all expense categories</p>
          </div>
          <button
            onClick={() => {
              setEditOverallInput(String(monthlyBudget || ''))
              setIsEditingOverall(!isEditingOverall)
            }}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
          >
            <Edit2 size={13} />
            {monthlyBudget > 0 ? 'Edit Limit' : 'Set Limit'}
          </button>
        </div>

        {isEditingOverall && (
          <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-slate-400">₹</span>
              <input
                type="number"
                placeholder="Enter monthly budget limit..."
                value={editOverallInput}
                onChange={e => setEditOverallInput(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <button
              onClick={handleSaveOverallBudget}
              className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Save Budget
            </button>
          </div>
        )}

        {monthlyBudget > 0 ? (
          <>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-slate-600 dark:text-slate-400">Budget Progress</span>
              <span className="text-slate-900 dark:text-white font-bold">{percentSpent}%</span>
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  percentSpent > 100 ? 'bg-rose-500' : percentSpent > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(percentSpent, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-2">
              <span>₹{monthlyExpense.toLocaleString('en-IN')} spent</span>
              <span>
                {remainingBudget >= 0
                  ? `₹${remainingBudget.toLocaleString('en-IN')} remaining`
                  : `Over budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}`}
              </span>
            </div>
          </>
        ) : (
          <div className="py-6 text-center">
            <Target size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Set your monthly budget</p>
            <p className="text-xs text-slate-400 mt-1 mb-3">
              Set a monthly spending budget to start tracking your spending adherence.
            </p>
            <button
              onClick={() => {
                setEditOverallInput('')
                setIsEditingOverall(true)
              }}
              className="px-4 py-2 bg-emerald-500 text-white text-xs font-semibold rounded-xl hover:bg-emerald-600 transition-all shadow-sm"
            >
              Set Spending Budget
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Recommendation Card */}
      {monthlyBudget > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800/40 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <Sparkles size={16} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900 dark:text-violet-200 mb-1">
                Real Spending Insight
              </p>
              <p className="text-sm text-violet-700 dark:text-violet-300">
                {percentSpent >= 100
                  ? `You have spent 100% of your ₹${monthlyBudget.toLocaleString('en-IN')} budget limit.`
                  : percentSpent >= 80
                  ? `You have spent ${percentSpent}% of your monthly budget limit. You have ₹${remainingBudget.toLocaleString('en-IN')} remaining.`
                  : `You've spent ${percentSpent}% of your monthly budget limit. Great job staying within budget!`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Category Specific Budgets</h3>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <Plus size={14} /> Add Category Budget
        </button>
      </div>

      {showAddModal && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Create Category Budget</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
              <select
                value={newBudgetCategory}
                onChange={e => setNewBudgetCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              >
                {['Food & Dining', 'Housing', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Groceries', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Category Limit (₹)</label>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={newBudgetAmount}
                onChange={e => setNewBudgetAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCategoryBudget}
              className="px-4 py-1.5 text-xs bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {categoryBudgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryBudgets.map(cat => {
            const pct = Math.min(100, Math.round((cat.spentAmount / cat.budgetAmount) * 100))
            const isOver = cat.spentAmount > cat.budgetAmount

            return (
              <div
                key={cat.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.emoji || '📊'}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.category}</p>
                      <p className="text-xs text-slate-400">
                        {isOver ? `Over by ₹${(cat.spentAmount - cat.budgetAmount).toLocaleString('en-IN')}` : `₹${(cat.budgetAmount - cat.spentAmount).toLocaleString('en-IN')} remaining`}
                      </p>
                    </div>
                  </div>
                  {isOver ? (
                    <AlertTriangle size={16} className="text-rose-500" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-500" />
                  )}
                </div>

                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Spent: ₹{cat.spentAmount.toLocaleString('en-IN')}</span>
                  <span>Budget: ₹{cat.budgetAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No category specific budgets created</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Create specific limits for Food, Transport, Shopping, etc.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Create First Category Budget
          </button>
        </div>
      )}
    </div>
  )
}
