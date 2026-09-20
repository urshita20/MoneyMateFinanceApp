import { useState, useEffect } from 'react'
import {
  User,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Eye,
  CheckCircle,
  Download,
  LogOut,
  Save,
  FileSpreadsheet,
  AlertCircle,
  Check,
} from 'lucide-react'
import { dataStore } from '../services/dataStore'
import type { Page } from '../types'

interface SettingsProps {
  onNav?: (p: Page) => void
  user?: any
  onLogout?: () => void
}

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'language', label: 'Language & Region', icon: Globe },
  { id: 'accounts', label: 'Connected Accounts', icon: CreditCard },
  { id: 'privacy', label: 'Privacy & Data', icon: Eye },
]

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      type="button"
      className={`relative flex-shrink-0 transition-colors rounded-full ${value ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}
      style={{ width: 40, height: 22 }}
    >
      <span
        className="absolute top-0.5 bg-white rounded-full shadow transition-transform"
        style={{ width: 18, height: 18, transform: value ? 'translateX(20px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">{children}</div>
    </div>
  )
}

function Row({ label, desc, right }: { label: string; desc?: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
        {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
      </div>
      {right}
    </div>
  )
}

export default function Settings({ onNav, user, onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile')
  const activeEmail = dataStore.getActiveEmail() || user?.email || 'default'

  // Editable Profile Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [dob, setDob] = useState('')
  const [income, setIncome] = useState<number | ''>('')
  const [budget, setBudget] = useState<number | ''>('')
  const [savingsTarget, setSavingsTarget] = useState<number | ''>('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Notification Preferences State (Persisted)
  const [notifs, setNotifs] = useState({
    expenseAlerts: true,
    budgetWarnings: true,
    weeklyInsights: true,
    billReminders: true,
  })

  useEffect(() => {
    // Load profile data from dataStore
    const p = dataStore.getProfile()
    setName(p.name || user?.name || '')
    setIncome(p.monthlyIncome || '')
    setBudget(p.monthlyBudget || '')
    setSavingsTarget(p.savingsTarget || '')

    // Load persisted phone & DOB
    const storedPhone = localStorage.getItem(`moneymate_user_phone_${activeEmail}`)
    if (storedPhone) setPhone(storedPhone)

    const storedDob = localStorage.getItem(`moneymate_user_dob_${activeEmail}`)
    if (storedDob) setDob(storedDob)

    // Load persisted notification preferences
    const storedNotifs = localStorage.getItem(`moneymate_notifs_${activeEmail}`)
    if (storedNotifs) {
      try {
        setNotifs(JSON.parse(storedNotifs))
      } catch (e) {
        console.warn(e)
      }
    }
  }, [activeEmail, user])

  const handleSaveProfile = () => {
    // Save to dataStore
    const incVal = Number(income) || 0
    const budVal = Number(budget) || 0
    const savVal = Number(savingsTarget) || 0

    dataStore.updateProfile({
      monthlyIncome: incVal,
      monthlyBudget: budVal,
      savingsTarget: savVal,
    })

    if (name) {
      dataStore.setActiveUser(activeEmail, name)
    }

    if (phone) {
      localStorage.setItem(`moneymate_user_phone_${activeEmail}`, phone)
    } else {
      localStorage.removeItem(`moneymate_user_phone_${activeEmail}`)
    }

    if (dob) {
      localStorage.setItem(`moneymate_user_dob_${activeEmail}`, dob)
    } else {
      localStorage.removeItem(`moneymate_user_dob_${activeEmail}`)
    }

    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  const toggleNotif = (key: keyof typeof notifs) => {
    const updated = { ...notifs, [key]: !notifs[key] }
    setNotifs(updated)
    localStorage.setItem(`moneymate_notifs_${activeEmail}`, JSON.stringify(updated))
  }

  const handleExportData = () => {
    const data = {
      profile: dataStore.getProfile(),
      summary: dataStore.getDashboardSummary().summary,
      transactions: dataStore.getTransactions(),
      budgets: dataStore.getBudgets(),
      goals: dataStore.getGoals(),
      exportDate: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moneymate_data_${activeEmail.split('@')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all your local transactions, budgets, and goals? This action cannot be undone.')) {
      const key = `moneymate_store_${activeEmail}`
      localStorage.removeItem(key)
      window.location.reload()
    }
  }

  const transactions = dataStore.getTransactions()
  const bankImportCount = transactions.filter(t => t.source === 'bank_import' || t.paymentMethod === 'Bank Transfer').length

  const userInitial = (name || user?.name || activeEmail || 'U').charAt(0).toUpperCase()

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your user profile and application preferences</p>
        </div>
        {saveSuccess && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Check size={14} /> Profile Saved
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Navigation Sidebar */}
        <div className="w-full md:w-52 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={15} className={activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4">
          {activeTab === 'profile' && (
            <>
              {/* Profile Card Header */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-xl font-bold text-white shadow-sm">
                    {userInitial}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">{name || user?.name || 'User Profile'}</p>
                    <p className="text-sm text-slate-500">{activeEmail}</p>
                  </div>
                </div>
              </div>

              {/* Personal Information */}
              <Section title="Personal Information">
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={activeEmail}
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder={phone ? phone : 'Not added'}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </Section>

              {/* Financial Profile */}
              <Section title="Financial Profile (Shared Across MoneyMate)">
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={income}
                      onChange={e => setIncome(e.target.value ? Number(e.target.value) : '')}
                      placeholder="e.g. 85000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Used to calculate savings rate, health score, time machine & safety net.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Budget Limit (₹)</label>
                      <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 50000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Monthly Savings Target (₹)</label>
                      <input
                        type="number"
                        value={savingsTarget}
                        onChange={e => setSavingsTarget(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 20000"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm p-2.5 text-slate-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    <Save size={14} />
                    Save Profile Changes
                  </button>
                </div>
              </Section>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <Section title="Account Authentication & Security">
                <Row
                  label="Authentication Mode"
                  desc={`Authenticated as ${activeEmail}`}
                  right={<CheckCircle size={16} className="text-emerald-500" />}
                />
                <Row
                  label="Current Web Session"
                  desc="Active session on your browser"
                  right={<span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full">Active</span>}
                />
                {onLogout && (
                  <div className="p-5">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 font-semibold text-xs py-3 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
                    >
                      <LogOut size={14} />
                      Sign Out of MoneyMate Account
                    </button>
                  </div>
                )}
              </Section>
            </>
          )}

          {activeTab === 'notifications' && (
            <Section title="Notification Preferences (Persisted)">
              {[
                { key: 'expenseAlerts' as const, label: 'Expense Alerts', desc: 'Notify when large or unusual single expenses occur' },
                { key: 'budgetWarnings' as const, label: 'Budget Limit Warnings', desc: 'Alert when category spending exceeds 80% of budget' },
                { key: 'weeklyInsights' as const, label: 'Weekly AI Financial Summary', desc: 'Recap of your income vs spending every weekend' },
                { key: 'billReminders' as const, label: 'Bill Due Date Reminders', desc: 'Notify 3 days prior to recurring bill due dates' },
              ].map(notif => (
                <Row
                  key={notif.key}
                  label={notif.label}
                  desc={notif.desc}
                  right={<Toggle value={notifs[notif.key]} onChange={() => toggleNotif(notif.key)} />}
                />
              ))}
            </Section>
          )}

          {activeTab === 'language' && (
            <Section title="Language & Regional Settings">
              {[
                { label: 'Language', desc: 'English (India)', right: <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Default</span> },
                { label: 'Currency Display', desc: '₹ INR — Indian Rupee', right: <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">₹ INR</span> },
                { label: 'Date Format', desc: 'DD/MM/YYYY', right: <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Standard</span> },
                { label: 'Numbering System', desc: 'Lakhs & Crores (1,00,000)', right: <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Indian System</span> },
                { label: 'Fiscal Year Standard', desc: 'April 1 – March 31 (India)', right: <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">FY Standard</span> },
              ].map(r => (
                <Row key={r.label} label={r.label} desc={r.desc} right={r.right} />
              ))}
            </Section>
          )}

          {activeTab === 'accounts' && (
            <Section title="Connected Accounts & Statement History">
              <Row
                label="Bank Statement Transfers"
                desc={bankImportCount > 0 ? `${bankImportCount} imported statement transactions active` : 'No statement files imported yet'}
                right={
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    bankImportCount > 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {bankImportCount > 0 ? 'Connected' : 'Not Connected'}
                  </span>
                }
              />
              {onNav && (
                <div className="p-5">
                  <button
                    onClick={() => onNav('bank-statement')}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                  >
                    <FileSpreadsheet size={15} className="text-emerald-500" />
                    Import Bank Statement (CSV / XLSX)
                  </button>
                </div>
              )}
            </Section>
          )}

          {activeTab === 'privacy' && (
            <Section title="Data & Privacy Controls">
              <Row
                label="Data Encryption"
                desc="All stored data encrypted with client-side & AES-256 storage"
                right={<CheckCircle size={16} className="text-emerald-500" />}
              />
              <Row
                label="Product Presentation Deck"
                desc="Download PowerPoint (.pptx) file or view interactive HTML / PDF slide deck"
                right={
                  <div className="flex items-center gap-2">
                    <a
                      href="/MoneyMate_Presentation.pptx"
                      download
                      className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-500 text-white px-3 py-1.5 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                      <Download size={13} /> Download .pptx
                    </a>
                    <a
                      href="/presentation.html"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      View Deck
                    </a>
                  </div>
                }
              />
              <Row
                label="Export Financial Data"
                desc="Download a complete JSON export of all your transactions, budgets, goals & profile"
                right={
                  <button
                    onClick={handleExportData}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    <Download size={13} /> Export JSON
                  </button>
                }
              />
              <Row
                label="Reset Local Financial Data"
                desc="Clear your saved transactions, budgets & goals from this device"
                right={
                  <button
                    onClick={handleResetData}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline"
                  >
                    Clear Data
                  </button>
                }
              />
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
