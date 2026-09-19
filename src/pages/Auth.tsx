import { useState } from 'react'
import { Eye, EyeOff, TrendingUp, ArrowRight, ShieldCheck, BarChart3, Bot } from 'lucide-react'
import type { Page } from '../types'
import { api } from '../services/api'

interface AuthProps {
  onNav: (p: Page) => void
  initial: 'login' | 'signup'
  onAuthSuccess?: (user: any) => void
}

function formatErrorMessage(msg: string): string {
  if (!msg) return '';
  try {
    if (msg.trim().startsWith('[')) {
      const parsed = JSON.parse(msg);
      if (Array.isArray(parsed)) {
        return parsed.map((e: any) => e.message || e.code).join('. ');
      }
    }
  } catch (e) {
    // ignore parse error
  }
  return msg;
}

export default function Auth({ onNav, initial, onAuthSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initial)
  const [showPass, setShowPass] = useState(false)
  const [forgotPass, setForgotPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    try {
      if (mode === 'signup') {
        const res = await api.auth.register(form.name || 'New User', form.email, form.password)
        if (res.success && res.user) {
          if (onAuthSuccess) onAuthSuccess(res.user)
          onNav('dashboard')
        } else {
          setErrorMsg(res.message || 'Registration failed')
        }
      } else {
        const res = await api.auth.login(form.email, form.password)
        if (res.success && res.user) {
          if (onAuthSuccess) onAuthSuccess(res.user)
          onNav('dashboard')
        } else {
          setErrorMsg(res.message || 'Invalid credentials')
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden flex-col justify-between p-12">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl -translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl translate-x-1/3 translate-y-1/3" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-lg">MoneyMate</p>
            <p className="text-xs text-emerald-400">Personal Finance Copilot</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Take control of
            <br />
            <span className="text-emerald-400">your real finances</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed max-w-sm">
            Track expenses, scan receipt bills with real OCR, monitor spending budgets, and build custom financial goals.
          </p>

          {/* Real Feature Highlights */}
          <div className="space-y-3 pt-2">
            {[
              { icon: ShieldCheck, title: '100% Private & Persistent', desc: 'Stored securely in your private account' },
              { icon: BarChart3, title: 'Real-Time Calculations', desc: 'No dummy values or hardcoded estimates' },
              { icon: Bot, title: 'Smart OCR Bill Scanner', desc: 'Scan receipts and verify expense details' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                <f.icon size={20} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative text-xs text-slate-500">
          © 2026 MoneyMate Finance Application. All rights reserved.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">MoneyMate</span>
          </div>

          {forgotPass ? (
            <ForgotPassword onBack={() => setForgotPass(false)} />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                {mode === 'login'
                  ? "Don't have an account? "
                  : 'Already have an account? '}
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-medium">
                  {formatErrorMessage(errorMsg)}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                      <span className="text-[11px] text-slate-400">Min 2 characters</span>
                    </div>
                    <input
                      type="text"
                      minLength={2}
                      placeholder="Your Full Name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                    <span className="text-[11px] text-slate-400">Min 6 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      minLength={6}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                      required
                      className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-sm shadow-emerald-500/25 hover:shadow-emerald-500/40 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={15} />
                </button>
              </form>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-xs text-slate-400">or continue with</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>

              <button className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm">
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>

              {mode === 'signup' && (
                <p className="text-xs text-slate-400 text-center mt-5">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-emerald-600 hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function ForgotPassword({ onBack }: { onBack: () => void }) {
  const [sent, setSent] = useState(false)
  const [email, setEmail] = useState('')

  return (
    <>
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-6 flex items-center gap-1">
        ← Back to sign in
      </button>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Reset password</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
        {sent
          ? `We've sent a reset link to ${email}. Check your inbox.`
          : "Enter your email and we'll send you a reset link."}
      </p>
      {!sent ? (
        <div className="space-y-4">
          <input
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
          />
          <button
            onClick={() => setSent(true)}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors"
          >
            Send reset link
            <ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="text-center p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium">Reset link sent!</p>
        </div>
      )}
    </>
  )
}
