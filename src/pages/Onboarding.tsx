import { useState } from 'react'
import { TrendingUp, ChevronRight, CheckCircle, Wallet, Target, PiggyBank } from 'lucide-react'
import type { Page } from '../types'
import { api } from '../services/api'
import { dataStore } from '../services/dataStore'

const steps = [
  { id: 1, title: 'Monthly Income', subtitle: 'What is your regular monthly income?' },
  { id: 2, title: 'Monthly Spending Budget', subtitle: 'Set your overall target spending limit' },
  { id: 3, title: 'Savings Target (Optional)', subtitle: 'How much do you aim to save each month?' },
  { id: 4, title: 'Preferences & Notifications', subtitle: 'Customize your alerts and experience' },
]

interface OnboardingProps {
  onNav: (p: Page) => void
}

export default function Onboarding({ onNav }: OnboardingProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    income: '',
    budget: '',
    savingsTarget: '',
    notifications: { expense: true, budget: true, insights: true, bills: true },
  })

  const progress = (step / steps.length) * 100

  const toggleNotif = (key: keyof typeof form.notifications) =>
    setForm(f => ({ ...f, notifications: { ...f.notifications, [key]: !f.notifications[key] } }))

  const handleFinish = async () => {
    setLoading(true)
    try {
      const incomeVal = parseFloat(form.income) || 0
      const budgetVal = parseFloat(form.budget) || 0
      const targetVal = parseFloat(form.savingsTarget) || 0

      dataStore.updateProfile({
        monthlyIncome: incomeVal,
        monthlyBudget: budgetVal,
        savingsTarget: targetVal,
      })

      api.auth.setup({
        monthlyIncome: incomeVal,
        monthlyBudget: budgetVal,
        savingsTarget: targetVal,
      }).catch(console.warn)
    } catch (err) {
      console.error('Setup save error:', err)
    } finally {
      setLoading(false)
      onNav('dashboard')
    }
  }

  const next = () => {
    if (step < steps.length) setStep(s => s + 1)
    else handleFinish()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">MoneyMate</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Step {step} of {steps.length}</span>
          <button
            onClick={() => onNav('dashboard')}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          {/* Step indicators */}
          <div className="flex items-center gap-2 mb-8 justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    s.id < step
                      ? 'bg-emerald-500 text-white'
                      : s.id === step
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {s.id < step ? <CheckCircle size={16} /> : s.id}
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${s.id < step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{steps[step - 1].title}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{steps[step - 1].subtitle}</p>

            {/* Step 1: Monthly Income */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Wallet size={20} />
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Entering your real income allows MoneyMate to calculate savings rates and monthly budget ratios accurately.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">What's your monthly income?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter amount (e.g. 60000)"
                      value={form.income}
                      onChange={e => setForm(f => ({ ...f, income: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Monthly Budget */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Target size={20} />
                  </div>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300">
                    Your monthly budget is used to calculate spending progress, overspending alerts, and budget discipline score.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">What's your monthly spending budget?</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter budget limit (e.g. 35000)"
                      value={form.budget}
                      onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Savings Target */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-800/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <PiggyBank size={20} />
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    Optional: How much would you like to save into emergency funds or investments each month?
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Monthly Savings Target (Optional)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      placeholder="Enter target (e.g. 15000)"
                      value={form.savingsTarget}
                      onChange={e => setForm(f => ({ ...f, savingsTarget: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Notifications */}
            {step === 4 && (
              <div className="space-y-3">
                {[
                  { key: 'expense' as const, label: 'Expense alerts', desc: 'Notify when a transaction is added' },
                  { key: 'budget' as const, label: 'Budget warnings', desc: 'Alert when 80% of budget is reached' },
                  { key: 'insights' as const, label: 'AI insights', desc: 'Get smart suggestions based on real spending' },
                  { key: 'bills' as const, label: 'Bill reminders', desc: 'Remind before payment due dates' },
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

            {/* Navigation buttons */}
            <div className="mt-6 flex items-center gap-3">
              {step > 1 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all text-sm"
                >
                  Back
                </button>
              )}
              <button
                onClick={next}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-sm ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'Saving Setup...' : step === steps.length ? 'Complete Setup & Go to Dashboard' : 'Continue'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
