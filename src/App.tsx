import { useState, useEffect } from 'react'
import type { Page } from './types'
import { api } from './services/api'
import { dataStore } from './services/dataStore'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import ProfileSwitcher from './pages/ProfileSwitcher'
import Layout from './components/Layout'
import JuniorLayout from './components/JuniorLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budget from './pages/Budget'
import AIInsights from './pages/AIInsights'
import AIChat from './pages/AIChat'
import OCRScanner from './pages/OCRScanner'
import Goals from './pages/Goals'
import KnowledgeHub from './pages/KnowledgeHub'
import Settings from './pages/Settings'
import AddExpense from './pages/AddExpense'
import Investments from './pages/Investments'
import Portfolio from './pages/Portfolio'
import Market from './pages/Market'
import FinancialHealth from './pages/FinancialHealth'
import AIDashboard from './pages/AIDashboard'
import TimeMachine from './pages/TimeMachine'
import SafetyNet from './pages/SafetyNet'
import JuniorDashboard from './pages/junior/JuniorDashboard'
import JuniorGoals from './pages/junior/JuniorGoals'
import JuniorQuests from './pages/junior/JuniorQuests'
import JuniorBuySim from './pages/junior/JuniorBuySim'
import JuniorStreaks from './pages/junior/JuniorStreaks'

const juniorPages: Page[] = ['junior-dashboard', 'junior-goals', 'junior-quests', 'junior-buy-sim', 'junior-streaks']

export default function App() {
  const [page, setPage] = useState<Page>('landing')
  const [dark, setDark] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  useEffect(() => {
    // Load authenticated user on app load
    const token = localStorage.getItem('moneymate_token')
    if (token) {
      api.auth.getMe().then(res => {
        if (res.success && res.user) {
          setUser(res.user)
          dataStore.setActiveUser(res.user.email, res.user.name)
          if (res.user.monthlyIncome > 0 || res.user.monthlyBudget > 0) {
            dataStore.updateProfile({
              monthlyIncome: res.user.monthlyIncome,
              monthlyBudget: res.user.monthlyBudget,
              savingsTarget: res.user.savingsTarget,
            })
          }
          dataStore.syncWithBackend()
        }
      }).catch(console.error)
    }
  }, [page])

  const nav = (p: Page) => setPage(p)
  const toggleDark = () => setDark(d => !d)

  const handleLogout = () => {
    localStorage.removeItem('moneymate_token')
    setUser(null)
    setPage('landing')
  }

  if (page === 'landing') return <Landing onNav={nav} />
  if (page === 'login' || page === 'signup') return <Auth onNav={nav} initial={page} onAuthSuccess={(u) => { setUser(u); nav('dashboard'); }} />
  if (page === 'onboarding') return <Onboarding onNav={nav} />
  if (page === 'profile-switcher') return <ProfileSwitcher onNav={nav} user={user} />

  if (juniorPages.includes(page)) {
    return (
      <JuniorLayout page={page} onNav={nav}>
        {page === 'junior-dashboard' && <JuniorDashboard />}
        {page === 'junior-goals' && <JuniorGoals />}
        {page === 'junior-quests' && <JuniorQuests />}
        {page === 'junior-buy-sim' && <JuniorBuySim />}
        {page === 'junior-streaks' && <JuniorStreaks />}
      </JuniorLayout>
    )
  }

  return (
    <Layout page={page} onNav={nav} dark={dark} onToggleDark={toggleDark} user={user} onLogout={handleLogout}>
      {page === 'dashboard' && <Dashboard onNav={nav} user={user} />}
      {page === 'transactions' && <Transactions />}
      {page === 'budget' && <Budget />}
      {page === 'insights' && <AIInsights />}
      {page === 'chat' && <AIChat />}
      {page === 'ocr' && <OCRScanner onNav={nav} />}
      {page === 'goals' && <Goals />}
      {page === 'knowledge' && <KnowledgeHub />}
      {page === 'settings' && <Settings />}
      {page === 'add-expense' && <AddExpense onNav={nav} />}
      {page === 'investments' && <Investments />}
      {page === 'portfolio' && <Portfolio />}
      {page === 'market' && <Market />}
      {page === 'financial-health' && <FinancialHealth />}
      {page === 'ai-dashboard' && <AIDashboard />}
      {page === 'time-machine' && <TimeMachine />}
      {page === 'safety-net' && <SafetyNet />}
    </Layout>
  )
}
