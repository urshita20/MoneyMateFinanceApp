import { useState, useEffect } from 'react'
import type { Page } from './types'
import { api } from './services/api'
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
import HealthScore from './pages/HealthScore'
import Goals from './pages/Goals'
import Bills from './pages/Bills'
import KnowledgeHub from './pages/KnowledgeHub'
import Settings from './pages/Settings'
import AddExpense from './pages/AddExpense'
import Loans from './pages/Loans'
import Investments from './pages/Investments'
import Portfolio from './pages/Portfolio'
import Market from './pages/Market'
import NetWorth from './pages/NetWorth'
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
    // Load current authenticated user on boot
    api.auth.getMe().then(res => {
      if (res.success && res.user) {
        setUser(res.user)
      }
    }).catch(console.error)
  }, [])

  const nav = (p: Page) => setPage(p)
  const toggleDark = () => setDark(d => !d)

  if (page === 'landing') return <Landing onNav={nav} />
  if (page === 'login' || page === 'signup') return <Auth onNav={nav} initial={page} onAuthSuccess={(u) => setUser(u)} />
  if (page === 'onboarding') return <Onboarding onNav={nav} />
  if (page === 'profile-switcher') return <ProfileSwitcher onNav={nav} />

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
    <Layout page={page} onNav={nav} dark={dark} onToggleDark={toggleDark}>
      {page === 'dashboard' && <Dashboard onNav={nav} user={user} />}
      {page === 'transactions' && <Transactions />}
      {page === 'budget' && <Budget />}
      {page === 'insights' && <AIInsights />}
      {page === 'chat' && <AIChat />}
      {page === 'ocr' && <OCRScanner onNav={nav} />}
      {page === 'health' && <HealthScore />}
      {page === 'goals' && <Goals />}
      {page === 'bills' && <Bills />}
      {page === 'knowledge' && <KnowledgeHub />}
      {page === 'settings' && <Settings />}
      {page === 'add-expense' && <AddExpense onNav={nav} />}
      {page === 'loans' && <Loans />}
      {page === 'investments' && <Investments />}
      {page === 'portfolio' && <Portfolio />}
      {page === 'market' && <Market />}
      {page === 'networth' && <NetWorth />}
      {page === 'financial-health' && <FinancialHealth />}
      {page === 'ai-dashboard' && <AIDashboard />}
      {page === 'time-machine' && <TimeMachine />}
      {page === 'safety-net' && <SafetyNet />}
    </Layout>
  )
}
