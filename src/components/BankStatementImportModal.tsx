import React, { useState } from 'react'
import { Upload, FileSpreadsheet, X, Check, AlertTriangle, ArrowRight, Trash2, Edit3, ShieldAlert } from 'lucide-react'
import * as XLSX from 'xlsx'
import { dataStore, type TransactionItem } from '../services/dataStore'

interface BankStatementImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

export interface ParsedItem {
  id: string
  selected: boolean
  date: string
  merchant: string
  description: string
  amount: number
  type: 'expense' | 'income'
  category: string
  emoji: string
  isDuplicate: boolean
  duplicateTx?: TransactionItem
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

export default function BankStatementImportModal({ isOpen, onClose, onImportComplete }: BankStatementImportModalProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([])
  const [fileName, setFileName] = useState('')

  // Column Mappings
  const [mapping, setMapping] = useState({
    date: '',
    merchant: '',
    amount: '',
    debit: '',
    credit: '',
    type: '',
    category: '',
  })

  // Parsed Items for preview
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])

  if (!isOpen) return null

  const handleCancel = () => {
    if (step !== 'upload') {
      setStep('upload')
      setFileName('')
      setRawHeaders([])
      setRawRows([])
      setParsedItems([])
      setMapping({
        date: '',
        merchant: '',
        amount: '',
        debit: '',
        credit: '',
        type: '',
        category: '',
      })
    } else {
      onClose()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const workbook = XLSX.read(bstr, { type: 'binary' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const jsonRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
        if (!jsonRows || jsonRows.length === 0) {
          alert('No data rows found in file.')
          return
        }

        const headers = Object.keys(jsonRows[0])
        setRawHeaders(headers)
        setRawRows(jsonRows)

        // Heuristic auto-mapping
        const autoMap = {
          date: headers.find(h => /date|time|period/i.test(h)) || '',
          merchant: headers.find(h => /description|particulars|merchant|narration|remarks|payee|name/i.test(h)) || '',
          amount: headers.find(h => /amount|sum|val/i.test(h)) || '',
          debit: headers.find(h => /debit|withdrawal|spent|dr/i.test(h)) || '',
          credit: headers.find(h => /credit|deposit|received|cr/i.test(h)) || '',
          type: headers.find(h => /type|kind|mode/i.test(h)) || '',
          category: headers.find(h => /category|cat|tag/i.test(h)) || '',
        }
        setMapping(autoMap)
        setStep('mapping')
      } catch (err) {
        alert('Failed to parse statement file. Please ensure it is a valid CSV or Excel file.')
      }
    }

    reader.readAsBinaryString(file)
  }

  const handleProcessMapping = () => {
    const items: ParsedItem[] = []

    rawRows.forEach((row, idx) => {
      const dateVal = row[mapping.date] ? String(row[mapping.date]).trim() : new Date().toISOString().split('T')[0]
      const merchantVal = row[mapping.merchant] ? String(row[mapping.merchant]).trim() : 'Bank Transaction'
      const categoryRaw = row[mapping.category] ? String(row[mapping.category]).trim() : ''

      let amount = 0
      let type: 'expense' | 'income' = 'expense'

      const debitVal = mapping.debit ? parseFloat(String(row[mapping.debit]).replace(/[^0-9.]/g, '')) : 0
      const creditVal = mapping.credit ? parseFloat(String(row[mapping.credit]).replace(/[^0-9.]/g, '')) : 0
      const amountVal = mapping.amount ? parseFloat(String(row[mapping.amount]).replace(/[^0-9.]/g, '')) : 0
      const typeStr = mapping.type ? String(row[mapping.type]).toLowerCase() : ''

      if (debitVal > 0) {
        amount = debitVal
        type = 'expense'
      } else if (creditVal > 0) {
        amount = creditVal
        type = 'income'
      } else if (amountVal > 0) {
        amount = amountVal
        if (typeStr.includes('credit') || typeStr.includes('income') || typeStr.includes('cr')) {
          type = 'income'
        } else {
          type = 'expense'
        }
      }

      if (amount <= 0) return

      // Categorization
      let catObj = { category: 'Uncategorized', emoji: '📦' }
      if (categoryRaw && CATEGORIES.includes(categoryRaw)) {
        catObj = { category: categoryRaw, emoji: '🏷️' }
      } else {
        catObj = dataStore.categorizeMerchant(merchantVal, '', amount, type)
      }

      // Check duplicates
      const dupCheck = dataStore.checkDuplicate({
        merchant: merchantVal,
        amount,
        date: dateVal,
      })

      items.push({
        id: `parsed_${idx}_${Date.now()}`,
        selected: !dupCheck.isDuplicate,
        date: dateVal,
        merchant: merchantVal,
        description: merchantVal,
        amount,
        type,
        category: catObj.category,
        emoji: catObj.emoji,
        isDuplicate: dupCheck.isDuplicate,
        duplicateTx: dupCheck.existingTx,
      })
    })

    setParsedItems(items)
    setStep('preview')
  }

  const handleToggleSelect = (id: string) => {
    setParsedItems(prev => prev.map(item => item.id === id ? { ...item, selected: !item.selected } : item))
  }

  const handleUpdateItem = (id: string, field: keyof ParsedItem, val: any) => {
    setParsedItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val }
        if (field === 'merchant' || field === 'type') {
          const cat = dataStore.categorizeMerchant(updated.merchant, '', updated.amount, updated.type)
          updated.category = cat.category
          updated.emoji = cat.emoji
        }
        return updated
      }
      return item
    }))
  }

  const handleDeleteItem = (id: string) => {
    setParsedItems(prev => prev.filter(item => item.id !== id))
  }

  const handleImportConfirm = () => {
    const selected = parsedItems.filter(i => i.selected)
    if (selected.length === 0) {
      alert('Please select at least one transaction to import.')
      return
    }

    const txsToImport = selected.map(item => ({
      merchant: item.merchant,
      amount: item.amount,
      category: item.category,
      type: item.type,
      emoji: item.emoji,
      date: item.date,
      description: item.description,
      source: 'bank_import' as const,
      paymentMethod: 'Bank Transfer',
    }))

    dataStore.addBatchTransactions(txsToImport)
    onImportComplete()
    onClose()
  }

  const totalCount = parsedItems.length
  const selectedCount = parsedItems.filter(i => i.selected).length
  const expenseCount = parsedItems.filter(i => i.type === 'expense').length
  const incomeCount = parsedItems.filter(i => i.type === 'income').length

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Import Bank Statement</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Upload CSV, XLSX, or XLS financial history</p>
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
                <Upload size={28} />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Select Bank Statement File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                Upload your bank statement in .CSV, .XLSX, or .XLS format. We will parse and match column headers automatically.
              </p>
              <label className="cursor-pointer inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                <FileSpreadsheet size={16} />
                Browse File
                <input
                  type="file"
                  accept=".csv, .xlsx, .xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">File Loaded</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet size={16} className="text-emerald-500" />
                  {fileName} ({rawRows.length} rows detected)
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Map Statement Columns</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Match the fields below with column headers found in your uploaded bank statement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date Column *</label>
                    <select
                      value={mapping.date}
                      onChange={e => setMapping({ ...mapping, date: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- Select Date Column --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Merchant / Description *</label>
                    <select
                      value={mapping.merchant}
                      onChange={e => setMapping({ ...mapping, merchant: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- Select Description Column --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount Column (Single Column)</label>
                    <select
                      value={mapping.amount}
                      onChange={e => setMapping({ ...mapping, amount: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- None (Or use Debit/Credit below) --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Debit / Expense Column</label>
                    <select
                      value={mapping.debit}
                      onChange={e => setMapping({ ...mapping, debit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- None --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Credit / Income Column</label>
                    <select
                      value={mapping.credit}
                      onChange={e => setMapping({ ...mapping, credit: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- None --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type Indicator Column</label>
                    <select
                      value={mapping.type}
                      onChange={e => setMapping({ ...mapping, type: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl text-sm p-2.5"
                    >
                      <option value="">-- None --</option>
                      {rawHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {/* Summary Badges */}
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-400">Total Detected</p>
                  <p className="text-base font-bold text-slate-900 dark:text-white">{totalCount}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">Selected to Import</p>
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{selectedCount}</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-100 dark:border-rose-900/40">
                  <p className="text-xs text-rose-500">Expenses Detected</p>
                  <p className="text-base font-bold text-rose-600">{expenseCount}</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/40 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <p className="text-xs text-blue-500">Income Detected</p>
                  <p className="text-base font-bold text-blue-600">{incomeCount}</p>
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto max-h-[50vh]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase sticky top-0 z-10">
                    <tr>
                      <th className="p-3 w-8 text-center">Import</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Merchant / Description</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-900 dark:text-white">
                    {parsedItems.map(item => (
                      <tr key={item.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 ${item.isDuplicate ? 'bg-amber-50/50 dark:bg-amber-950/20' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleSelect(item.id)}
                            className="rounded accent-emerald-500 w-4 h-4"
                          />
                        </td>
                        <td className="p-3 font-mono">
                          <input
                            type="text"
                            value={item.date}
                            onChange={e => handleUpdateItem(item.id, 'date', e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-24"
                          />
                        </td>
                        <td className="p-3 font-medium">
                          <input
                            type="text"
                            value={item.merchant}
                            onChange={e => handleUpdateItem(item.id, 'merchant', e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-full min-w-[140px]"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={item.type}
                            onChange={e => handleUpdateItem(item.id, 'type', e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs"
                          >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <select
                            value={item.category}
                            onChange={e => handleUpdateItem(item.id, 'category', e.target.value)}
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs"
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td className="p-3 text-right font-semibold font-mono">
                          <input
                            type="number"
                            value={item.amount}
                            onChange={e => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-xs w-20 text-right"
                          />
                        </td>
                        <td className="p-3 text-center">
                          {item.isDuplicate ? (
                            <span className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full" title="Possible duplicate detected matching existing transaction">
                              <AlertTriangle size={10} /> Duplicate
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              New
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Remove row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            {step !== 'upload' ? 'Cancel & Upload New Statement' : 'Cancel'}
          </button>

          {step === 'mapping' && (
            <button
              onClick={handleProcessMapping}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm"
            >
              Next: Review Transactions
              <ArrowRight size={14} />
            </button>
          )}

          {step === 'preview' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep('mapping')}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 transition-colors"
              >
                Back to Mapping
              </button>
              <button
                onClick={handleImportConfirm}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all shadow-sm"
              >
                <Check size={14} />
                Import Selected ({selectedCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
