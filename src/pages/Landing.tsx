import { useState } from 'react'
import {
  TrendingUp,
  Sparkles,
  PieChart,
  Scan,
  Heart,
  MessageSquare,
  ChevronRight,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle,
} from 'lucide-react'
import type { Page } from '../types'

const features = [
  {
    icon: TrendingUp,
    title: 'Expense Tracking',
    desc: 'Track every rupee automatically. Smart categorization with merchant recognition and real-time sync.',
    color: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600',
    border: 'border-emerald-100 dark:border-emerald-800/30',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    desc: 'Get personalized spending analysis, anomaly detection, and actionable recommendations powered by AI.',
    color: 'bg-blue-50 dark:bg-blue-900/20',
    iconColor: 'text-blue-600',
    border: 'border-blue-100 dark:border-blue-800/30',
  },
  {
    icon: PieChart,
    title: 'Budget Planner',
    desc: 'Set and manage monthly budgets by category. Get alerts before you overspend.',
    color: 'bg-purple-50 dark:bg-purple-900/20',
    iconColor: 'text-purple-600',
    border: 'border-purple-100 dark:border-purple-800/30',
  },
  {
    icon: Scan,
    title: 'OCR Receipt Scanner',
    desc: 'Snap a photo of any receipt and let AI extract merchant, amount, and category instantly.',
    color: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600',
    border: 'border-amber-100 dark:border-amber-800/30',
  },
  {
    icon: Heart,
    title: 'Financial Health Score',
    desc: 'Your personal finance score from 0–100. Track savings ratio, budget discipline, and emergency fund.',
    color: 'bg-rose-50 dark:bg-rose-900/20',
    iconColor: 'text-rose-600',
    border: 'border-rose-100 dark:border-rose-800/30',
  },
  {
    icon: MessageSquare,
    title: 'AI Chatbot',
    desc: 'Ask anything about your finances in plain language. "Can I afford a vacation?" Just ask.',
    color: 'bg-indigo-50 dark:bg-indigo-900/20',
    iconColor: 'text-indigo-600',
    border: 'border-indigo-100 dark:border-indigo-800/30',
  },
]

interface LandingProps {
  onNav: (p: Page) => void
}

export default function Landing({ onNav }: LandingProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">MoneyMate</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Pricing', 'About'].map(item => (
              <a
                key={item}
                href="#"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNav('login')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => onNav('signup')}
              className="text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900" />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10B981 0%, transparent 70%)' }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Zap size={11} className="fill-emerald-500 text-emerald-500" />
              100% Real Data Driven Application
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Your Real{' '}
              <span className="text-emerald-500">Financial</span>
              <br />
              Copilot
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Track actual expenses, scan bills with OCR, plan your spending budget, and achieve your goals using your own persistent data.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              <button
                onClick={() => onNav('signup')}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNav('dashboard')}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all"
              >
                View Dashboard
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Core Value Pillars */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { value: '100% Private', label: 'Persistent Database' },
                { value: 'Real OCR', label: 'Bill Scanner' },
                { value: 'Zero Mock', label: 'Actual User Data' },
              ].map(stat => (
                <div key={stat.label} className="text-center bg-white/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 rounded-xl px-4 py-2.5 shadow-sm">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Your complete financial command center
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              From expense tracking to AI-powered insights — MoneyMate gives you everything to stay in control of your money.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(feat => (
              <div
                key={feat.title}
                className={`${feat.color} border ${feat.border} rounded-2xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer group`}
              >
                <div className={`w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  <feat.icon size={18} className={feat.iconColor} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start your financial journey today
          </h2>
          <p className="text-emerald-100 mb-8">
            Take complete control of your real financial management with MoneyMate.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNav('signup')}
              className="flex items-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                <TrendingUp size={13} className="text-white" />
              </div>
              <span className="font-bold text-white">MoneyMate</span>
            </div>
            <p className="text-sm">© 2026 MoneyMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
