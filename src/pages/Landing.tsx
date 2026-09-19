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
  Star,
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

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Software Engineer, Bangalore',
    quote: "Finshpere completely transformed how I manage my finances. The AI insights are spot-on — it told me I was spending ₹4,000 extra on dining before I even noticed.",
    avatar: 'PS',
    stars: 5,
    color: 'from-pink-400 to-rose-500',
  },
  {
    name: 'Rahul Mehta',
    role: 'Startup Founder, Mumbai',
    quote: "Best finance app I've used. The OCR scanner saves me hours of manual data entry. My accountant loves that I have organized records now.",
    avatar: 'RM',
    stars: 5,
    color: 'from-blue-400 to-indigo-500',
  },
  {
    name: 'Ananya Patel',
    role: 'Product Manager, Hyderabad',
    quote: "The financial health score keeps me motivated. I went from 58 to 82 in just 3 months by following the AI recommendations.",
    avatar: 'AP',
    stars: 5,
    color: 'from-emerald-400 to-teal-500',
  },
]

interface LandingProps {
  onNav: (p: Page) => void
}

export default function Landing({ onNav }: LandingProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Finshpere</span>
          </div>

          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Pricing', 'Blog', 'About'].map(item => (
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
              Powered by Advanced AI
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Your AI{' '}
              <span className="text-emerald-500">Financial</span>
              <br />
              Copilot
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed max-w-xl mx-auto">
              Track expenses, get AI insights, plan your budget, and achieve your financial goals — all in one beautiful
              place.
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
                View Demo
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              {[
                { value: '2L+', label: 'Users' },
                { value: '₹500Cr+', label: 'Tracked' },
                { value: '4.9★', label: 'App Rating' },
              ].map(stat => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="mt-16 relative">
            <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
              {/* Mockup topbar */}
              <div className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-white dark:bg-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 max-w-xs">
                    paisabuddy.app/dashboard
                  </div>
                </div>
              </div>

              {/* Mockup content */}
              <div className="flex">
                {/* Sidebar mockup */}
                <div className="w-48 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-3 space-y-1 flex-shrink-0">
                  <div className="flex items-center gap-2 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg mb-3">
                    <div className="w-5 h-5 bg-emerald-500 rounded-md" />
                    <div className="w-16 h-2 bg-emerald-200 dark:bg-emerald-800 rounded" />
                  </div>
                  {[60, 48, 52, 44, 55].map((w, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                      <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
                      <div className={`h-2 bg-slate-100 dark:bg-slate-800 rounded`} style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>

                {/* Main mockup */}
                <div className="flex-1 p-4 bg-slate-50 dark:bg-slate-950">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Balance', value: '₹1,24,500', color: 'bg-emerald-500' },
                      { label: 'Income', value: '₹85,000', color: 'bg-blue-500' },
                      { label: 'Expenses', value: '₹52,340', color: 'bg-rose-400' },
                      { label: 'Health', value: '74/100', color: 'bg-amber-400' },
                    ].map(card => (
                      <div key={card.label} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                        <div className={`w-6 h-6 ${card.color} rounded-lg mb-2`} />
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{card.value}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{card.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholders */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 col-span-2">
                      <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-3" />
                      <div className="flex items-end gap-1.5 h-16">
                        {[40, 65, 45, 80, 55, 70].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col gap-0.5 items-stretch">
                            <div className="bg-emerald-400 rounded-t" style={{ height: `${h}%` }} />
                            <div className="bg-rose-300 rounded-t" style={{ height: `${100 - h}%`, maxHeight: '40%' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded mb-3" />
                      <div className="w-20 h-20 rounded-full border-8 border-emerald-100 dark:border-emerald-900/40 border-t-emerald-500 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-emerald-400/10 blur-3xl rounded-full" />
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
              From expense tracking to AI-powered insights — Finshpere gives you everything to stay in control of your
              money.
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
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Learn more <ChevronRight size={12} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits strip */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Bank-level Security', desc: '256-bit encryption, biometric authentication, and secure cloud sync.' },
              { icon: Zap, title: 'Real-time Sync', desc: 'Instant sync across all your devices. Never miss a transaction.' },
              { icon: Sparkles, title: 'AI-Powered', desc: 'Gemini AI analyzes your spending patterns and gives personalized advice.' },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-3">Loved by users</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Real results from real people
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div
                key={t.name}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-slate-400">{t.role}</p>
                  </div>
                </div>
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
            Join 2 lakh+ Indians who have already taken control of their finances.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNav('signup')}
              className="flex items-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Get Started Free
              <ArrowRight size={16} />
            </button>
            <div className="flex items-center gap-2 text-emerald-100 text-sm">
              <CheckCircle size={14} className="fill-emerald-200 text-emerald-200" />
              No credit card required
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <TrendingUp size={13} className="text-white" />
                </div>
                <span className="font-bold text-white">Finshpere</span>
              </div>
              <p className="text-sm leading-relaxed">Your AI-powered financial copilot for smarter money management.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Press'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Security', 'Cookies'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-sm font-semibold text-white mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-sm">© 2025 Finshpere. All rights reserved.</p>
            <p className="text-sm">Made with ❤️ in India</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
