import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import type { Page } from '../types'

interface LayoutProps {
  page: Page
  onNav: (p: Page) => void
  dark: boolean
  onToggleDark: () => void
  children: ReactNode
}

export default function Layout({ page, onNav, dark, onToggleDark, children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar currentPage={page} onNav={onNav} />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopBar onNav={onNav} dark={dark} onToggleDark={onToggleDark} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
