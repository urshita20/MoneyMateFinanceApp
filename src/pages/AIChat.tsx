import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Plus, Trash2 } from 'lucide-react'
import { api } from '../services/api'

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

export default function AIChat() {
  const user = JSON.parse(localStorage.getItem('moneymate_user') || '{}');
  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      text: `Hi ${firstName}! 👋 I'm your AI financial assistant. I have access to your spending data, budgets, and goals. Ask me anything about your finances!`,
      timestamp: '10:30 AM',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeConv, setActiveConv] = useState(1)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  useEffect(() => { scrollToBottom() }, [messages])

  const sendMessage = async (text: string) => {
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

    try {
      const response = await api.ai.chat(text)
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.reply || response.message || "I couldn't process that. Try asking about your budget, spending, or savings!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(m => [...m, aiMsg])
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 🔄",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(m => [...m, errorMsg])
    } finally {
      setLoading(false)
    }
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
