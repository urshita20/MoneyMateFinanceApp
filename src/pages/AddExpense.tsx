import { useState } from 'react'
import { Upload, Scan, X, CheckCircle } from 'lucide-react'
import type { Page } from '../types'

const categories = [
  { id: 'food', label: 'Food', emoji: '🍕' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'health', label: 'Health', emoji: '💊' },
  { id: 'utilities', label: 'Utilities', emoji: '⚡' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'rent', label: 'Rent', emoji: '🏠' },
  { id: 'other', label: 'Other', emoji: '📦' },
]

const paymentMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Wallet']

interface AddExpenseProps {
  onNav: (p: Page) => void
}

export default function AddExpense({ onNav }: AddExpenseProps) {
  const [form, setForm] = useState({
    amount: '',
    category: 'food',
    merchant: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paymentMethod: 'UPI',
  })
  const [saved, setSaved] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => onNav('dashboard'), 1500)
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expense saved!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting to dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add Expense</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Record a new expense manually</p>
        </div>
        <button
          onClick={() => onNav('dashboard')}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
        >
          <X size={18} />
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
          <p className="text-slate-500 text-xs mt-3">Enter the expense amount</p>
        </div>

        {/* Form fields */}
        <div className="p-6 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
            <div className="grid grid-cols-6 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                    form.category === cat.id
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl">{cat.emoji}</span>
                  <span className="text-xs text-slate-600 dark:text-slate-400">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Merchant / Place</label>
              <input
                type="text"
                placeholder="Swiggy, Amazon, Uber..."
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Notes (optional)</label>
            <textarea
              placeholder="Add any notes about this expense..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all resize-none"
            />
          </div>

          {/* Receipt upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Attach Receipt</label>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false) }}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                dragOver
                  ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Upload size={20} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Drag & drop or <span className="text-emerald-600 dark:text-emerald-400 font-medium">browse</span></p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, PDF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            Save Expense
          </button>
          <button
            onClick={() => onNav('ocr')}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <Scan size={16} />
            Scan Receipt
          </button>
          <button
            onClick={() => onNav('dashboard')}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-medium py-3 px-4 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
