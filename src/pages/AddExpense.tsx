import { useState } from 'react'
import { Upload, Scan, X, CheckCircle } from 'lucide-react'
import type { Page } from '../types'
import { api } from '../services/api'

const categories = [
  { id: 'Food & Dining', label: 'Food', emoji: '🍕' },
  { id: 'Transport', label: 'Transport', emoji: '🚗' },
  { id: 'Shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'Entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'Health', label: 'Health', emoji: '💊' },
  { id: 'Utilities', label: 'Utilities', emoji: '⚡' },
  { id: 'Groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'Education', label: 'Education', emoji: '📚' },
  { id: 'Salary', label: 'Salary', emoji: '💰' },
  { id: 'Freelance', label: 'Freelance', emoji: '💻' },
  { id: 'Other', label: 'Other', emoji: '📦' },
]

const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Wallet']

interface AddExpenseProps {
  onNav: (p: Page) => void
}

export default function AddExpense({ onNav }: AddExpenseProps) {
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [form, setForm] = useState({
    amount: '',
    category: 'Food & Dining',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'UPI',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.merchant || !form.amount) {
      setError('Please enter both merchant name and amount')
      return
    }

    setSaving(true)
    setError('')
    try {
      const selectedCat = categories.find(c => c.id === form.category)
      const res = await api.transactions.create({
        merchant: form.merchant,
        amount: parseFloat(form.amount),
        category: form.category,
        type: type,
        emoji: selectedCat?.emoji || '💸',
        date: form.date,
        description: form.notes,
        paymentMethod: form.paymentMethod,
      })

      if (res.success) {
        setSaved(true)
        setTimeout(() => onNav('dashboard'), 1200)
      } else {
        setError(res.message || 'Failed to save transaction')
      }
    } catch (err: any) {
      setError(err.message || 'Server error saving transaction')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Transaction Saved!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Updating dashboard & analytics…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {type === 'expense' ? 'Add Expense' : 'Add Income'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Record a transaction in your database</p>
        </div>
        <button
          onClick={() => onNav('dashboard')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 text-sm">
          {error}
        </div>
      )}

      {/* Type Selector */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
        <button
          onClick={() => setType('expense')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
            type === 'expense' ? 'bg-white dark:bg-slate-900 text-rose-500 shadow-sm' : 'text-slate-500'
          }`}
        >
          Expense (-)
        </button>
        <button
          onClick={() => setType('income')}
          className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
            type === 'income' ? 'bg-white dark:bg-slate-900 text-emerald-500 shadow-sm' : 'text-slate-500'
          }`}
        >
          Income (+)
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Amount hero */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 p-8 text-center">
          <p className="text-slate-400 text-sm mb-3">Amount</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-light text-slate-300">₹</span>
            <input
              type="number"
              placeholder="0.00"
              value={form.amount}
              onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="text-5xl font-bold text-white bg-transparent border-none outline-none w-48 text-center placeholder-slate-600"
            />
          </div>
          <p className="text-slate-500 text-xs mt-3">Enter the {type} amount</p>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                    form.category === cat.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 font-semibold'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {type === 'expense' ? 'Merchant / Place' : 'Source / Employer'}
              </label>
              <input
                type="text"
                placeholder={type === 'expense' ? 'Swiggy, Amazon, Uber...' : 'Company Salary, Client...'}
                value={form.merchant}
                onChange={e => setForm(f => ({ ...f, merchant: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Payment method */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
            <div className="flex flex-wrap gap-2">
              {paymentMethods.map(method => (
                <button
                  key={method}
                  onClick={() => setForm(f => ({ ...f, paymentMethod: method }))}
                  className={`px-3 py-1.5 text-sm rounded-xl border transition-all ${
                    form.paymentMethod === method
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Description (optional)</label>
            <textarea
              placeholder="Add details about this transaction..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-sm ${
              saving ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Transaction'}
          </button>
          <button
            onClick={() => onNav('ocr')}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <Scan size={16} />
            Scan Bill OCR
          </button>
        </div>
      </div>
    </div>
  )
}
