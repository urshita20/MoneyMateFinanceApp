import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Plus, Trash2 } from 'lucide-react'

interface Message {
  id: number
  role: 'user' | 'assistant'
  text: string
  timestamp: string
}

const suggestedPrompts = [
  'How can I save more money this month?',
  'Where am I overspending?',
  'Can I afford a vacation to Goa?',
  'Explain the new tax regime vs old.',
  'How do I build an emergency fund?',
  'What\'s the best SIP for beginners?',
  'Should I prepay my home loan?',
  'How to improve my credit score?',
]

const conversations = [
  { id: 1, title: 'Monthly savings advice', date: 'Today' },
  { id: 2, title: 'Tax regime comparison', date: 'Yesterday' },
  { id: 3, title: 'Vacation budget planning', date: 'Jul 15' },
  { id: 4, title: 'Emergency fund setup', date: 'Jul 10' },
]

const aiResponses: Record<string, string> = {
  default: "Based on your financial data, here's my analysis:\n\n**Current status:** You're spending ₹52,340/month against ₹85,000 income, leaving a savings rate of **38.4%**.\n\n**Top recommendation:** Your dining expenses are 18% higher than last month at ₹12,400. Setting a ₹10,000 limit on food would save you ₹2,400/month — that's ₹28,800/year.\n\nWould you like me to create a custom savings plan?",
  save: "Here are 5 ways to save more this month:\n\n1. **Cut dining out**: You spent ₹12,400 on food. Cooking at home 3x more per week could save ₹3,000.\n\n2. **Cancel unused subscriptions**: I see Netflix, Hotstar, and Spotify — consider keeping just one.\n\n3. **Use metro on weekends**: Weekend Uber spend is 40% of your total transport. Metro saves ~₹800/month.\n\n4. **Enable UPI cashback**: Set up Paytm/PhonePe cashback offers for grocery shopping.\n\n5. **Automate savings**: Set up an auto-transfer of ₹10,000 on salary day to a separate account.\n\nEstimated monthly savings: **₹4,800–₹6,500** 🎯",
  vacation: "Based on your finances, a Goa vacation is **definitely feasible**! Here's a breakdown:\n\n**Your Goa vacation budget estimate:**\n- Flights (round trip): ₹6,000–₹12,000\n- Hotel (4 nights): ₹8,000–₹16,000\n- Food & activities: ₹5,000\n- Shopping: ₹3,000\n- **Total: ₹22,000–₹36,000**\n\n**Can you afford it?** Yes! You have ₹32,000 saved toward your Goa goal. You could go in February 2026 with your current savings rate. Want me to create a dedicated vacation savings plan?",
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('save') || lower.includes('saving')) return aiResponses.save
  if (lower.includes('vacation') || lower.includes('goa') || lower.includes('afford')) return aiResponses.vacation
  return aiResponses.default
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: "Hi Arjun! 👋 I'm your AI financial assistant. I have access to your spending data, budgets, and goals. Ask me anything about your finances!",
      timestamp: '10:30 AM',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConv, setActiveConv] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => { scrollToBottom() }, [messages])

  const sendMessage = (text: string) => {
    if (!text.trim()) return

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: getAIResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(m => [...m, aiMsg])
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-112px)]">
      {/* Conversation history */}
      <div className="w-56 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <button className="w-full flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
            <Plus size={14} />
            New Chat
          </button>
        </div>
        <div className="flex-1 p-2 overflow-y-auto space-y-1">
          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => setActiveConv(conv.id)}
              className={`w-full text-left p-3 rounded-xl transition-all group ${
                activeConv === conv.id
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <p className={`text-xs font-medium truncate ${activeConv === conv.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {conv.title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{conv.date}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Chat window */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Finshpere AI</p>
            <p className="text-xs text-emerald-500">● Online — Financial Assistant</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles size={13} className="text-white" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs font-bold">
                  A
                </div>
              )}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-500 text-white rounded-tr-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.text.split('\n').map((line, i) => {
                    const bold = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    return <p key={i} className={i > 0 ? 'mt-1' : ''} dangerouslySetInnerHTML={{ __html: bold }} />
                  })}
                </div>
                <span className="text-xs text-slate-400">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about your finances..."
              className="flex-1 px-4 py-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="w-11 h-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-all"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="w-52 flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suggested</p>
        </div>
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => sendMessage(prompt)}
              className="w-full text-left p-3 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 text-center">AI responses are based on your actual financial data</p>
        </div>
      </div>
    </div>
  )
}
