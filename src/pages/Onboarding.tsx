import { useState } from 'react'
import { TrendingUp, ChevronRight, CheckCircle } from 'lucide-react'
import type { Page } from '../types'

const steps = [
  { id: 1, title: "What's your name?", subtitle: "Let's personalize your experience" },
  { id: 2, title: 'Monthly income & currency', subtitle: 'This helps us set realistic budgets' },
  { id: 3, title: 'Your financial goals', subtitle: 'Select all that apply' },
  { id: 4, title: 'Budget preferences', subtitle: 'Choose your preferred spending categories' },
  { id: 5, title: 'Stay informed', subtitle: 'Set up your notification preferences' },
]

const goals = [
  { id: 'emergency', label: 'Build Emergency Fund', emoji: '🛡️' },
  { id: 'debt', label: 'Pay Off Debt', emoji: '💸' },
  { id: 'vacation', label: 'Save for Vacation', emoji: '✈️' },
  { id: 'home', label: 'Buy a Home', emoji: '🏠' },
  { id: 'investment', label: 'Start Investing', emoji: '📈' },
  { id: 'retirement', label: 'Retirement Planning', emoji: '🌴' },
  { id: 'education', label: 'Child\'s Education', emoji: '🎓' },
  { id: 'vehicle', label: 'Buy a Vehicle', emoji: '🚗' },
]

const categories = [
  { id: 'food', label: 'Food & Dining', emoji: '🍕' },
  { id: 'transport', label: 'Transport', emoji: '🚗' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'health', label: 'Health', emoji: '💊' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'utilities', label: 'Utilities', emoji: '⚡' },
  { id: 'education', label: 'Education', emoji: '📚' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'fitness', label: 'Fitness', emoji: '💪' },
]

const currencies = ['₹ INR', '$ USD', '€ EUR', '£ GBP', '¥ JPY', '৳ BDT']

interface OnboardingProps {
  onNav: (p: Page) => void
}

export default function Onboarding({ onNav }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '',
    income: '',
    currency: '₹ INR',
    goals: [] as string[],
    categories: [] as string[],
    notifications: { expense: true, budget: true, insights: true, bills: true },
  })

  const progress = ((step - 1) / (steps.length - 1)) * 100

  const toggleGoal = (id: string) =>
    setForm(f => ({
      ...f,
      goals: f.goals.includes(id) ? f.goals.filter(g => g !== id) : [...f.goals, id],
    }))

  const toggleCategory = (id: string) =>
    setForm(f => ({
      ...f,
      categories: f.categories.includes(id) ? f.categories.filter(c => c !== id) : [...f.categories, id],
    }))

  const toggleNotif = (key: keyof typeof form.notifications) =>
    setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: !f.notifications[key] } }))

  const next = () => {
    if (step < steps.length) setStep(s => s + 1)
    else onNav('dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white">Finshpere</span>
        </div>
        <span className="text-sm text-slate-400">Step {step} of {steps.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.id < step
                      ? 'bg-emerald-500 text-white'
                      : s.id === step
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.id < step ? <CheckCircle size={14} /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 w-8 ${s.id < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{steps[step - 1].title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{steps[step - 1].subtitle}</p>

            {/* Step content */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Your full name</label>
                  <input
                    type="text"
                    placeholder="Arjun Sharma"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  />
                </div>
                {form.name && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <p className="text-sm text-emerald-700 dark:text-emerald-300">
                      👋 Welcome, <strong>{form.name}</strong>! Let's set up your financial profile.
                    </p>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly income</label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={form.income}
                    onChange={e => setForm(f => ({ ...f, income: e.target.value }))}
                    className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                  <div className="grid grid-cols-3 gap-2">
                    {currencies.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm(f => ({ ...f, currency: c }))}
                        className={`py-2.5 px-3 text-sm rounded-xl border transition-all ${
                          form.currency === c
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 font-medium'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-2">
                {goals.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all text-sm ${
                      form.goals.includes(goal.id)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{goal.emoji}</span>
                    <span className="font-medium text-xs">{goal.label}</span>
                    {form.goals.includes(goal.id) && (
                      <CheckCircle size={13} className="ml-auto text-emerald-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {step === 4 && (
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      form.categories.includes(cat.id)
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{cat.emoji}</span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{cat.label}</span>
                  </button>
                ))}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3">
                {[
                  { key: 'expense' as const, label: 'Expense alerts', desc: 'Notify when a large expense is detected' },
                  { key: 'budget' as const, label: 'Budget warnings', desc: 'Alert when 80% of budget is used' },
                  { key: 'insights' as const, label: 'Weekly AI insights', desc: 'Get your weekly financial summary' },
                  { key: 'bills' as const, label: 'Bill reminders', desc: 'Remind 3 days before due date' },
                ].map(notif => (
                  <div
                    key={notif.key}
                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{notif.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                    </div>
                    <button
                      onClick={() => toggleNotif(notif.key)}
                      className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${
                        form.notifications[notif.key] ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                      style={{ height: '22px', width: '40px' }}
                    >
                      <span
                        className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform`}
                        style={{
                          width: '18px',
                          height: '18px',
                          transform: form.notifications[notif.key] ? 'translateX(20px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Next button */}
            <button
              onClick={next}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm"
            >
              {step === steps.length ? 'Go to Dashboard' : 'Continue'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
