import { useState, useRef } from 'react'
import { Upload, CheckCircle, Edit2, X, AlertTriangle, FileText } from 'lucide-react'
import type { Page } from '../types'
import { api } from '../services/api'
import Tesseract from 'tesseract.js'

interface OCRScannerProps {
  onNav: (p: Page) => void
}

export default function OCRScanner({ onNav }: OCRScannerProps) {
  const [dragOver, setDragOver] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [progressStatus, setProgressStatus] = useState('Initializing OCR Engine...')
  const [ocrProgress, setOcrProgress] = useState(0)

  // Image preview state
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  // Extracted data state (editable)
  const [merchant, setMerchant] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('Food & Dining')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [description, setDescription] = useState('')
  const [confidence, setConfidence] = useState(85)
  const [isDuplicate, setIsDuplicate] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WEBP).')
      return
    }

    setError('')
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result as string
      setImageSrc(base64)
      processOCR(base64)
    }
    reader.readAsDataURL(file)
  }

  const processOCR = async (base64Image: string) => {
    setScanning(true)
    setOcrProgress(10)
    setProgressStatus('Reading text from receipt...')

    try {
      // 1. First try backend OCR endpoint
      const backendRes = await api.transactions.ocrScan(base64Image)
      if (backendRes.success && backendRes.extractedData) {
        const data = backendRes.extractedData
        setMerchant(data.merchant || 'Store / Merchant')
        setAmount(data.amount ? String(data.amount) : '')
        setDate(data.date ? String(data.date) : new Date().toISOString().split('T')[0])
        setCategory(data.category || 'Food & Dining')
        setPaymentMethod(data.paymentMethod || 'UPI')
        setDescription(data.description || 'Scanned Receipt Expense')
        setConfidence(backendRes.confidence || 90)
        setIsDuplicate(data.isPossibleDuplicate || false)
        setScanning(false)
        return
      }
    } catch (backendErr) {
      console.warn('Backend OCR fallback to browser Tesseract:', backendErr)
    }

    // 2. Client-side Tesseract.js fallback
    try {
      setOcrProgress(30)
      setProgressStatus('Analyzing image pixels with Tesseract.js...')

      const result = await Tesseract.recognize(base64Image, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(30 + Math.round((m.progress || 0) * 60))
            setProgressStatus(`Recognizing text (${Math.round((m.progress || 0) * 100)}%)...`)
          }
        },
      })

      const rawText = result.data.text
      const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean)

      // Infer merchant
      let foundMerchant = 'Unknown Merchant'
      const ignore = /receipt|tax|invoice|bill|welcome|customer|total|gst|cashier/i
      for (const line of lines.slice(0, 5)) {
        if (line.length >= 3 && !ignore.test(line)) {
          foundMerchant = line
          break
        }
      }

      // Infer amount
      let foundAmount = ''
      const amountRegex = /(?:total|amount|due|paid|bal|inr|rs|₹)\s*[:=]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
      const match = rawText.match(amountRegex)
      if (match && match[1]) {
        foundAmount = match[1].replace(/,/g, '')
      } else {
        // Find numbers
        const numbers = rawText.match(/\b\d+(?:\.\d{1,2})?\b/g)
        if (numbers) {
          const validNums = numbers
            .map(n => parseFloat(n))
            .filter(n => !isNaN(n) && n > 0 && n < 100000 && !/20[2-3][0-9]/.test(String(n)))
          if (validNums.length > 0) {
            foundAmount = String(Math.max(...validNums))
          }
        }
      }

      setMerchant(foundMerchant)
      setAmount(foundAmount)
      setDate(new Date().toISOString().split('T')[0])
      setConfidence(Math.round(result.data.confidence || 85))
      setDescription(`Receipt scanned via OCR (${foundMerchant})`)
    } catch (err: any) {
      console.error('Tesseract client OCR error:', err)
      setError('Could not confidently read all details. Please verify and fill in missing fields below.')
      setMerchant('Scanned Merchant')
      setAmount('')
    } finally {
      setScanning(false)
    }
  }

  const handleSaveTransaction = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid expense amount.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await api.transactions.create({
        merchant: merchant || 'Scanned Expense',
        amount: parseFloat(amount),
        category,
        type: 'expense',
        date,
        description,
        paymentMethod,
        receiptImage: imageSrc || undefined,
      })

      if (res.success) {
        setSaved(true)
        setTimeout(() => onNav('dashboard'), 1200)
      } else {
        setError(res.message || 'Failed to save transaction')
      }
    } catch (err: any) {
      setError(err.message || 'Error saving OCR transaction')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">OCR Expense Saved!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Updating dashboard, budget, & analytics…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Real OCR Receipt Scanner</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Upload any receipt image to extract & record transactions into your persistent database
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      {!imageSrc && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0])
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-16 text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0])
              }
            }}
          />
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload size={24} className="text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Upload your bill or receipt
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Drag & drop your receipt image here or <span className="text-emerald-600 dark:text-emerald-400 font-medium">click to upload</span>
          </p>
          <p className="text-xs text-slate-400 mt-2">Supports JPG, JPEG, PNG, WEBP formats</p>
        </div>
      )}

      {/* Loading Scanning Screen */}
      {scanning && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto relative">
            <div className="w-16 h-16 border-4 border-emerald-200 dark:border-emerald-900 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin" />
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900 dark:text-white mb-1">Reading receipt image...</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{progressStatus}</p>
          </div>
          <div className="w-64 mx-auto bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
          </div>
        </div>
      )}

      {/* Review Expense Screen (Side-by-Side Image + Review Form) */}
      {imageSrc && !scanning && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Receipt text extracted successfully</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">OCR Confidence Score: {confidence}%</p>
              </div>
            </div>
            <button
              onClick={() => {
                setImageSrc(null)
                setMerchant('')
                setAmount('')
              }}
              className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 underline"
            >
              Upload Different Receipt
            </button>
          </div>

          {isDuplicate && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                <AlertTriangle size={16} />
                Possible Duplicate Expense: A transaction with this merchant and amount already exists.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column: Uploaded Receipt Image Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col items-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Original Uploaded Receipt</p>
              <div className="max-h-[380px] overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800 w-full flex items-center justify-center">
                <img src={imageSrc} alt="Uploaded Receipt" className="max-h-[350px] object-contain rounded-lg shadow-sm" />
              </div>
            </div>

            {/* Right Column: Editable Review Expense Form */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit2 size={16} className="text-emerald-500" />
                Review & Edit Expense
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Merchant / Store Name</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold text-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {['Food & Dining', 'Groceries', 'Transport', 'Shopping', 'Health', 'Utilities', 'Entertainment', 'Other'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                >
                  {['UPI', 'Credit Card', 'Debit Card', 'Cash', 'Net Banking'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  onClick={handleSaveTransaction}
                  disabled={saving}
                  className={`flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-all shadow-sm ${
                    saving ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Adding Expense...' : '+ Confirm & Add Expense'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
