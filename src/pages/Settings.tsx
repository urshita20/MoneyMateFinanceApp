import { useState } from 'react'
import {
  User,
  Shield,
  Bell,
  Globe,
  CreditCard,
  Lock,
  Eye,
  ChevronRight,
  CheckCircle,
  Smartphone,
  Mail,
} from 'lucide-react'

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'accounts', label: 'Connected Accounts', icon: CreditCard },
  { id: 'privacy', label: 'Privacy', icon: Eye },
]

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
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

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [notifs, setNotifs] = useState({
    expenseAlerts: true,
    budgetWarnings: true,
    weeklyInsights: true,
    billReminders: true,
    aiSuggestions: false,
    marketNews: false,
  })
  const [twoFA, setTwoFA] = useState(false)

  const toggleNotif = (key: keyof typeof notifs) =>
    setNotifs(n => ({ ...n, [key]: !n[key] }))

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account and preferences</p>
      </div>

      <div className="flex gap-5">
        {/* Tab list */}
        <div className="w-48 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-2 h-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <tab.icon size={15} className={activeTab === tab.id ? 'text-emerald-500' : 'text-slate-400'} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {activeTab === 'profile' && (
            <>
              {/* Avatar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                    A
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-900 dark:text-white">Arjun Sharma</p>
                    <p className="text-sm text-slate-500">arjun@gmail.com</p>
                    <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 hover:underline">
                      Change photo
                    </button>
                  </div>
                </div>
              </div>

              <Section title="Personal Information">
                {[
                  { label: 'Full Name', desc: 'Arjun Sharma', right: <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Edit</button> },
                  { label: 'Email', desc: 'arjun@gmail.com', right: <CheckCircle size={16} className="text-emerald-500" /> },
                  { label: 'Phone', desc: '+91 98765 43210', right: <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Edit</button> },
                  { label: 'Date of Birth', desc: '12 March 1992', right: <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Edit</button> },
                ].map(r => (
                  <Row key={r.label} label={r.label} desc={r.desc} right={r.right} />
                ))}
              </Section>

              <Section title="Financial Profile">
                {[
                  { label: 'Monthly Income', desc: '₹85,000', right: <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Update</button> },
                  { label: 'Currency', desc: '₹ INR — Indian Rupee', right: <ChevronRight size={14} className="text-slate-400" /> },
                  { label: 'Financial Goals', desc: 'Emergency Fund, Vacation', right: <ChevronRight size={14} className="text-slate-400" /> },
                ].map(r => (
                  <Row key={r.label} label={r.label} desc={r.desc} right={r.right} />
                ))}
              </Section>
            </>
          )}

          {activeTab === 'security' && (
            <>
              <Section title="Authentication">
                <Row
                  label="Password"
                  desc="Last changed 3 months ago"
                  right={<button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Change</button>}
                />
                <Row
                  label="Two-Factor Authentication"
                  desc={twoFA ? 'Enabled via authenticator app' : 'Add an extra layer of security'}
                  right={<Toggle value={twoFA} onChange={() => setTwoFA(t => !t)} />}
                />
                <Row
                  label="Biometric Login"
                  desc="Use fingerprint or Face ID"
                  right={<Toggle value={true} onChange={() => {}} />}
                />
              </Section>

              <Section title="Sessions">
                {[
                  { label: 'Chrome — MacBook Pro', desc: 'Active now · Bangalore, India', icon: '💻' },
                  { label: 'Safari — iPhone 15', desc: '2 hours ago · Bangalore, India', icon: '📱' },
                ].map(session => (
                  <Row
                    key={session.label}
                    label={session.label}
                    desc={session.desc}
                    right={<button className="text-xs text-rose-500 font-medium hover:text-rose-600">Revoke</button>}
                  />
                ))}
              </Section>
            </>
          )}

          {activeTab === 'notifications' && (
            <Section title="Notification Preferences">
              {[
                { key: 'expenseAlerts' as const, label: 'Expense Alerts', desc: 'When a large or unusual expense is detected' },
                { key: 'budgetWarnings' as const, label: 'Budget Warnings', desc: 'When you reach 80% of any category budget' },
                { key: 'weeklyInsights' as const, label: 'Weekly AI Insights', desc: 'Your personalized financial summary every Sunday' },
                { key: 'billReminders' as const, label: 'Bill Reminders', desc: '3 days before each bill is due' },
                { key: 'aiSuggestions' as const, label: 'AI Suggestions', desc: 'Daily personalized money-saving tips' },
                { key: 'marketNews' as const, label: 'Market News', desc: 'Major market and policy updates from RBI/SEBI' },
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
            <Section title="Language & Region">
              {[
                { label: 'Language', desc: 'English (India)', right: <ChevronRight size={14} className="text-slate-400" /> },
                { label: 'Currency Display', desc: '₹ INR', right: <ChevronRight size={14} className="text-slate-400" /> },
                { label: 'Date Format', desc: 'DD/MM/YYYY', right: <ChevronRight size={14} className="text-slate-400" /> },
                { label: 'Number Format', desc: '1,00,000 (Indian)', right: <ChevronRight size={14} className="text-slate-400" /> },
                { label: 'Fiscal Year Start', desc: 'April 1 (India standard)', right: <ChevronRight size={14} className="text-slate-400" /> },
              ].map(r => (
                <Row key={r.label} label={r.label} desc={r.desc} right={r.right} />
              ))}
            </Section>
          )}

          {activeTab === 'accounts' && (
            <>
              <Section title="Bank Accounts">
                {[
                  { label: 'HDFC Bank Savings', desc: '•••• 4521 · Last synced 2 min ago', status: 'connected' },
                  { label: 'SBI Current Account', desc: '•••• 8834 · Last synced 1 hour ago', status: 'connected' },
                ].map(acc => (
                  <Row
                    key={acc.label}
                    label={acc.label}
                    desc={acc.desc}
                    right={
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">Connected</span>
                        <button className="text-xs text-rose-500 font-medium">Remove</button>
                      </div>
                    }
                  />
                ))}
                <div className="px-5 py-4">
                  <button className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-400 hover:border-emerald-300 hover:text-emerald-600 dark:hover:border-emerald-700 dark:hover:text-emerald-400 transition-all">
                    + Connect New Account
                  </button>
                </div>
              </Section>
            </>
          )}

          {activeTab === 'privacy' && (
            <Section title="Data & Privacy">
              {[
                { label: 'Data Encryption', desc: 'All data encrypted with AES-256', right: <CheckCircle size={16} className="text-emerald-500" /> },
                { label: 'Analytics', desc: 'Help improve Finshpere with usage data', right: <Toggle value={true} onChange={() => {}} /> },
                { label: 'Personalized Ads', desc: 'Show relevant financial product ads', right: <Toggle value={false} onChange={() => {}} /> },
                { label: 'Export My Data', desc: 'Download all your data as CSV/JSON', right: <button className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Export</button> },
                { label: 'Delete Account', desc: 'Permanently delete all your data', right: <button className="text-xs text-rose-500 font-medium">Delete</button> },
              ].map(r => (
                <Row key={r.label} label={r.label} desc={r.desc} right={r.right} />
              ))}
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}
