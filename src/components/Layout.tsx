import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { Page } from '../types'

interface LayoutProps {
  page: Page
  onNav: (p: Page) => void
  dark: boolean
  onToggleDark: () => void
  user?: any
  onLogout?: () => void
  onOpenReceiptModal?: () => void
  onOpenBankModal?: () => void
  children: ReactNode
}

export default function Layout({ page, onNav, dark, onToggleDark, user, onLogout, onOpenReceiptModal, onOpenBankModal, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPage={page} onNav={onNav} user={user} onLogout={onLogout} onOpenReceiptModal={onOpenReceiptModal} onOpenBankModal={onOpenBankModal} />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopBar onNav={onNav} dark={dark} onToggleDark={onToggleDark} user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
