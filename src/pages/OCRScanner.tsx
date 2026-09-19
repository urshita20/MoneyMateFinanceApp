import { useState, useCallback } from 'react'
import { Upload, Camera, Scan, CheckCircle, Edit2, X } from 'lucide-react'
import type { Page } from '../types'

interface OCRResult {
  merchant: string
  date: string
  amount: string
  category: string
  confidence: number
  items: Array<{ name: string; price: string }>
}

interface OCRScannerProps {
  onNav: (p: Page) => void
}

export default function OCRScanner({ onNav }: OCRScannerProps) {
  const [dragOver, setDragOver] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [editing, setEditing] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    startScan()
  }, [])

  const startScan = () => {
    setScanning(true)
    setResult(null)
    setTimeout(() => {
      setScanning(false)
      setResult({
        merchant: 'Swiggy',
        date: '2025-07-18',
        amount: '450.00',
        category: 'Food & Dining',
        confidence: 97,
        items: [
          { name: 'Butter Chicken', price: '₹280' },
          { name: 'Garlic Naan × 2', price: '₹90' },
          { name: 'Delivery charge', price: '₹45' },
          { name: 'Taxes & fees', price: '₹35' },
        ],
      })
    }, 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">OCR Receipt Scanner</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Scan any receipt — AI will extract all details automatically
        </p>
      </div>

      {!result && (
        <>
          {/* Upload area */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragOver
                ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            } ${scanning ? 'pointer-events-none' : ''}`}
            onClick={!scanning ? startScan : undefined}
          >
            {scanning ? (
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto relative">
                  <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full" />
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Scanning receipt...</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI is extracting details</p>
                </div>
                <div className="flex justify-center gap-1">
                  {['Detecting merchant', 'Reading amounts', 'Categorizing'].map((step, i) => (
                    <span
                      key={step}
                      className="text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40"
                      style={{ animationDelay: `${i * 400}ms` }}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto">
                  <Upload size={24} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                    Drop your receipt here
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    or <span className="text-emerald-600 dark:text-emerald-400 font-medium">click to browse</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF · Max 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Camera option */}
          <div className="flex gap-4">
            <button
              onClick={startScan}
              className="flex-1 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Use Camera</p>
                <p className="text-xs text-slate-400">Take a photo of receipt</p>
              </div>
            </button>
            <button
              onClick={startScan}
              className="flex-1 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 py-4 rounded-2xl transition-all group"
            >
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Scan size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Auto-scan</p>
                <p className="text-xs text-slate-400">Scan from clipboard</p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* OCR Results */}
      {result && (
        <div className="space-y-4">
          {/* Success header */}
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
            <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Receipt scanned successfully</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Confidence: {result.confidence}% accuracy</p>
            </div>
            <button
              onClick={() => setResult(null)}
              className="ml-auto p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-500"
            >
              <X size={14} />
            </button>
          </div>

          {/* Extracted data */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Extracted Information</h3>
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              >
                <Edit2 size={12} />
                {editing ? 'Done editing' : 'Edit'}
              </button>
            </div>

            <div className="p-5 space-y-4">
              {[
                { label: 'Merchant', key: 'merchant', value: result.merchant },
                { label: 'Date', key: 'date', value: result.date },
                { label: 'Total Amount', key: 'amount', value: `₹${result.amount}`, highlight: true },
                { label: 'Category', key: 'category', value: result.category },
              ].map(field => (
                <div key={field.key} className="flex items-center justify-between py-2 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{field.label}</span>
                  {editing ? (
                    <input
                      defaultValue={field.value}
                      className="text-sm font-medium text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        field.highlight ? 'text-emerald-600 dark:text-emerald-400 text-base' : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {field.value}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Line items */}
            <div className="px-5 pb-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Line Items</p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden">
                {result.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                  >
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-slate-400">AI Confidence Score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.confidence}%</span>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${result.confidence}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2">High confidence — all fields detected accurately</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => onNav('dashboard')}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-sm shadow-emerald-500/25"
            >
              Save Expense
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-xl transition-colors"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
