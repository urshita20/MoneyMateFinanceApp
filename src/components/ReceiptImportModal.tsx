import React, { useState } from 'react'
import { Upload, Camera, X, Check, Image as ImageIcon, Loader2, Edit3, AlertCircle } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import { dataStore } from '../services/dataStore'
import { api } from '../services/api'

interface ReceiptImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

const CATEGORIES = [
  'Food & Dining',
  'Transport',
  'Shopping',
  'Utilities',
  'Groceries',
  'Health',
  'Entertainment',
  'Education',
  'Salary',
  'Freelance',
  'Other',
  'Uncategorized',
]

const PAYMENT_METHODS = ['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking', 'Wallet']

export default function ReceiptImportModal({ isOpen, onClose, onImportComplete }: ReceiptImportModalProps) {
  const [step, setStep] = useState<'upload' | 'scanning' | 'review'>('upload')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [processingStatus, setProcessingStatus] = useState<string>('Analyzing receipt image with OCR...')

  // Extracted fields for side-by-side review
  const [form, setForm] = useState({
    merchant: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Dining',
    paymentMethod: 'UPI',
    description: '',
  })

  if (!isOpen) return null

  const handleCancel = () => {
    if (step !== 'upload') {
      setStep('upload')
      setImagePreview('')
      setForm({
        merchant: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Food & Dining',
        paymentMethod: 'UPI',
        description: '',
      })
    } else {
      onClose()
    }
  }

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const base64 = evt.target?.result as string
      setImagePreview(base64)
      setStep('scanning')

      try {
        setProcessingStatus('Performing OCR text extraction...')
        // Real OCR via Tesseract.js
        const worker = await createWorker('eng')
        const ret = await worker.recognize(base64)
        await worker.terminate()

        const text = ret.data.text || ''
        setProcessingStatus('Parsing merchant, amount, and date details...')

        // Parse Merchant name (first clean non-header line)
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
        let merchantName = 'Store Receipt'

        const ignoreHeaderRegex = /tax\s*invoice|cash\s*memo|receipt|welcome|thank\s*you|bill\s*no|original|duplicate|gstin|tin\b|cin\b|customer\s*copy|token\s*no/i
        for (const l of lines.slice(0, 6)) {
          const cleanedLine = l.replace(/^(welcome to|welcome|thank you for visiting|store|branch)\s*/i, '').trim()
          if (cleanedLine.length >= 3 && !ignoreHeaderRegex.test(cleanedLine) && !/^\d+$/.test(cleanedLine)) {
            merchantName = cleanedLine
            break
          }
        }

        // Parse Amount using robust multi-pass extraction
        let extractedAmount = dataStore.extractOcrAmount(text)

        // Parse Date (YYYY-MM-DD, DD/MM/YYYY, or DD-MM-YYYY)
        let extractedDate = new Date().toISOString().split('T')[0]
        const dateMatch = text.match(/(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})|(\d{4}[/-]\d{1,2}[/-]\d{1,2})/)
        if (dateMatch) {
          const rawDateStr = dateMatch[0]
          try {
            const d = new Date(rawDateStr)
            if (!isNaN(d.getTime())) {
              extractedDate = d.toISOString().split('T')[0]
            }
          } catch (e) {
            // Keep default date if unparseable
          }
        }

        // Smart Category Detection
        const catRes = dataStore.categorizeMerchant(merchantName, text, parseFloat(extractedAmount) || 0, 'expense')

        setForm({
          merchant: merchantName,
          amount: extractedAmount,
          date: extractedDate,
          category: catRes.category,
          paymentMethod: 'UPI',
          description: lines.slice(0, 3).join(' '),
        })

        setStep('review')
      } catch (err) {
        // Fallback to backend OCR if local worker fails
        try {
          const backendRes = await api.transactions.ocrScan(base64)
          if (backendRes && backendRes.success && backendRes.data) {
            const data = backendRes.data
            setForm({
              merchant: data.merchant || 'Store Receipt',
              amount: data.amount ? String(data.amount) : '',
              date: data.date || new Date().toISOString().split('T')[0],
              category: data.category || 'Food & Dining',
              paymentMethod: 'UPI',
              description: data.note || '',
            })
          }
        } catch (backendErr) {
          // Keep form editable without inventing numbers
        }
        setStep('review')
      }
    }

    reader.readAsDataURL(file)
  }

  const handleAddExpense = () => {
    if (!form.merchant || !form.amount) {
      alert('Please enter both Merchant name and Amount.')
      return
    }

    const numAmount = parseFloat(form.amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense amount.')
      return
    }

    const catObj = dataStore.categorizeMerchant(form.merchant, form.description, numAmount, 'expense')

    dataStore.addTransaction({
      merchant: form.merchant,
      amount: numAmount,
      category: form.category || catObj.category,
      type: 'expense',
      emoji: catObj.emoji,
      date: form.date,
      description: form.description,
      paymentMethod: form.paymentMethod,
      source: 'receipt_ocr',
      receiptUrl: imagePreview,
    })

    onImportComplete()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Receipt Image (OCR)</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Extract expense details automatically using optical character recognition</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-800/30">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Upload Receipt or Bill Image</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                Upload JPG, JPEG, PNG, or WEBP receipt photo. Our OCR engine will scan and extract merchant, amount, date, and category.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                <Camera size={16} />
                Browse Receipt Image
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {step === 'scanning' && (
            <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
              <Loader2 size={36} className="text-emerald-500 animate-spin" />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Analyzing Receipt Image</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{processingStatus}</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side: Original Receipt Preview */}
              <div className="bg-slate-900/5 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center min-h-[300px]">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 self-start">Original Receipt Image</p>
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Receipt preview"
                    className="max-h-[350px] w-auto object-contain rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">No image preview available</div>
                )}
              </div>

              {/* Right Side: Editable Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Edit3 size={15} className="text-emerald-500" />
                    Review Extracted Receipt Details
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Merchant Name *
                  </label>
                  <input
                    type="text"
                    value={form.merchant}
                    onChange={e => setForm({ ...form, merchant: e.target.value })}
                    placeholder="e.g. Swiggy, Starbucks, Supermarket"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold rounded-xl text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description / Item Notes
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Optional notes or item list"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors"
          >
            {step !== 'upload' ? 'Cancel & Upload New Image' : 'Cancel'}
          </button>

          {step === 'review' && (
            <button
              onClick={handleAddExpense}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/20"
            >
              <Check size={14} />
              Add Expense
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
