import { useState, useEffect } from 'react';
import {
  Plus, Calendar, Clock, AlertCircle, ShieldAlert, CheckCircle2,
  HelpCircle, Tag, ArrowUpRight, Search, Trash2, X, Filter, AlertTriangle, FileText, Check,
  Users, UserCheck, UserPlus, ArrowRightLeft, Receipt, Layers
} from 'lucide-react';
import { dataStore, CommitmentItem, TransactionItem, SharedExpenseItem, NetContactBalance } from '../services/dataStore';
import { detectCommitmentsFromTransactions } from '../services/commitmentDetector';
import { api } from '../services/api';

interface BillsCommitmentsProps {
  onNav?: (page: string) => void;
}

export default function BillsCommitments({ onNav }: BillsCommitmentsProps) {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [userCommitments, setUserCommitments] = useState<CommitmentItem[]>([]);
  const [allCommitments, setAllCommitments] = useState<CommitmentItem[]>([]);

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'recurring' | 'emi'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Bill Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    frequency: 'Monthly' as 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' | 'One-Time',
    category: 'Subscriptions',
    notes: '',
    emoji: '📄',
  });
  const [addError, setAddError] = useState('');

  // Selected Commitment Details Modal
  const [selectedCommitment, setSelectedCommitment] = useState<CommitmentItem | null>(null);

  // --- Shared Expenses State ---
  const [sharedExpenses, setSharedExpenses] = useState<SharedExpenseItem[]>([]);
  const [sharedSummary, setSharedSummary] = useState<{
    totalYouOwe: number;
    totalOwedToYou: number;
    netBalances: NetContactBalance[];
  }>({ totalYouOwe: 0, totalOwedToYou: 0, netBalances: [] });

  const [showAddSharedModal, setShowAddSharedModal] = useState(false);
  const [sharedForm, setSharedForm] = useState({
    description: '',
    amount: '',
    category: 'Food & Dining',
    groupName: 'Personal',
    participantInput: '',
    participantEmails: [] as string[],
  });
  const [sharedError, setSharedError] = useState('');
  const [isSubmittingShared, setIsSubmittingShared] = useState(false);
  const [selectedShared, setSelectedShared] = useState<SharedExpenseItem | null>(null);

  useEffect(() => {
    refreshData();
    loadSharedExpenses();
  }, []);

  const loadSharedExpenses = async () => {
    // 1. Get local cached shared expenses
    const local = dataStore.getSharedExpenses();
    setSharedExpenses(local);
    setSharedSummary(dataStore.getSharedExpenseSummary());

    // 2. Fetch from backend API
    try {
      const res = await api.sharedExpenses.getAll();
      if (res && res.success && Array.isArray(res.expenses)) {
        dataStore.setSharedExpenses(res.expenses);
        setSharedExpenses(res.expenses);
        setSharedSummary(dataStore.getSharedExpenseSummary());
      }
    } catch (err) {
      console.warn('Backend shared expense load fallback:', err);
    }
  };

  const handleAddParticipantEmail = () => {
    const email = sharedForm.participantInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSharedError('Please enter a valid email address (e.g. friend@example.com)');
      return;
    }

    const currentEmail = (dataStore.getActiveEmail() || '').toLowerCase().trim();
    if (email === currentEmail) {
      setSharedError('You are automatically included as the payer. Enter your friend\'s email to split with.');
      return;
    }

    if (sharedForm.participantEmails.includes(email)) {
      setSharedError('This email is already added to the split list.');
      return;
    }

    setSharedError('');
    setSharedForm(prev => ({
      ...prev,
      participantEmails: [...prev.participantEmails, email],
      participantInput: '',
    }));
  };

  const handleRemoveParticipantEmail = (emailToRemove: string) => {
    setSharedForm(prev => ({
      ...prev,
      participantEmails: prev.participantEmails.filter(e => e !== emailToRemove),
    }));
  };

  const handleCreateSharedExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSharedError('');

    if (!sharedForm.description.trim()) {
      setSharedError('Please enter an expense description (e.g. Dinner, Goa Trip)');
      return;
    }
    const amt = Number(sharedForm.amount);
    if (!amt || amt <= 0) {
      setSharedError('Please enter a valid expense amount (₹)');
      return;
    }
    if (sharedForm.participantEmails.length === 0) {
      setSharedError('Please add at least one registered MoneyMate friend\'s email to split this expense with.');
      return;
    }

    setIsSubmittingShared(true);
    try {
      const res = await api.sharedExpenses.create({
        description: sharedForm.description.trim(),
        amount: amt,
        participantEmails: sharedForm.participantEmails,
        category: sharedForm.category,
        groupName: sharedForm.groupName,
      });

      if (!res.success) {
        setSharedError(res.message || 'Failed to create shared expense');
        setIsSubmittingShared(false);
        return;
      }

      dataStore.addSharedExpense(res.expense);
      setShowAddSharedModal(false);
      setSharedForm({
        description: '',
        amount: '',
        category: 'Food & Dining',
        groupName: 'Personal',
        participantInput: '',
        participantEmails: [],
      });
      loadSharedExpenses();
    } catch (err: any) {
      setSharedError('Server error while saving shared expense.');
    } finally {
      setIsSubmittingShared(false);
    }
  };

  const handleSettleUp = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await api.sharedExpenses.settle(id);
    } catch (err) {}
    dataStore.settleSharedExpense(id);
    loadSharedExpenses();
    if (selectedShared && selectedShared.id === id) {
      setSelectedShared(null);
    }
  };

  const refreshData = () => {
    const txs = dataStore.getTransactions();
    const storedComms = dataStore.getCommitments();
    setTransactions(txs);
    setUserCommitments(storedComms);

    const detectedAndStored = detectCommitmentsFromTransactions(txs, storedComms);
    setAllCommitments(detectedAndStored);
  };

  const handleAddBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) {
      setAddError('Please enter a bill or commitment name');
      return;
    }
    const amt = Number(addForm.amount);
    if (!amt || amt <= 0) {
      setAddError('Please enter a valid amount (₹)');
      return;
    }

    dataStore.addCommitment({
      name: addForm.name.trim(),
      amount: amt,
      currency: 'INR',
      category: addForm.category,
      frequency: addForm.frequency,
      type: addForm.category === 'Loans & EMIs' ? 'emi' : 'manual',
      status: 'upcoming',
      dueDate: addForm.dueDate,
      nextExpectedDate: addForm.dueDate,
      source: 'manual',
      isConfirmed: true,
      notes: addForm.notes.trim(),
      emoji: addForm.emoji || '📄',
    });

    setShowAddModal(false);
    setAddForm({
      name: '',
      amount: '',
      dueDate: new Date().toISOString().split('T')[0],
      frequency: 'Monthly',
      category: 'Subscriptions',
      notes: '',
      emoji: '📄',
    });
    setAddError('');
    refreshData();
  };

  const handleConfirmEMI = (c: CommitmentItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    dataStore.confirmCommitment({
      ...c,
      type: 'emi',
      category: 'Loans & EMIs',
    });
    refreshData();
  };

  const handleDeleteCommitment = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('Are you sure you want to delete this commitment record?')) {
      dataStore.deleteCommitment(id);
      setSelectedCommitment(null);
      refreshData();
    }
  };

  // Calculations for Summary Cards
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const safeAllCommitments = Array.isArray(allCommitments) ? allCommitments.filter(Boolean) : [];
  const activeCommitments = safeAllCommitments.filter(c => c.status !== 'paid');

  // A. Upcoming This Month
  const thisMonthCommitments = activeCommitments.filter(c => {
    if (!c.nextExpectedDate && !c.dueDate) return false;
    const dateStr = c.nextExpectedDate || c.dueDate || '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const upcomingThisMonthTotal = thisMonthCommitments.reduce((sum, c) => sum + (c.amount || 0), 0);

  // B. Recurring Payments Count
  const recurringCount = safeAllCommitments.filter(c => c.type === 'recurring' || c.frequency !== 'One-Time').length;

  // C. EMIs Count
  const emiCount = safeAllCommitments.filter(c => c.type === 'emi' || (c.isConfirmed && c.category === 'Loans & EMIs')).length;

  // D. Next Payment
  const sortedUpcoming = [...activeCommitments].sort((a, b) => {
    const dA = new Date(a.nextExpectedDate || a.dueDate || '2099-12-31').getTime();
    const dB = new Date(b.nextExpectedDate || b.dueDate || '2099-12-31').getTime();
    const timeA = isNaN(dA) ? 9999999999999 : dA;
    const timeB = isNaN(dB) ? 9999999999999 : dB;
    return timeA - timeB;
  });
  const nextPayment = sortedUpcoming.length > 0 ? sortedUpcoming[0] : null;

  // Filtered List
  const filteredCommitments = safeAllCommitments.filter(c => {
    if (!c) return false;
    if (activeTab === 'upcoming' && c.status === 'paid') return false;
    if (activeTab === 'recurring' && c.type !== 'recurring') return false;
    if (activeTab === 'emi' && c.type !== 'emi' && c.category !== 'Loans & EMIs') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (c.name || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q) ||
        (c.amount || '').toString().includes(q)
      );
    }
    return true;
  });

  // Source Label formatting helper
  const renderSourceLabel = (c: CommitmentItem) => {
    if (c.source === 'manual') {
      return (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
          Source: Added manually
        </span>
      );
    }
    if (c.source === 'user_confirmed') {
      return (
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
          <Check size={11} /> Source: Confirmed by user
        </span>
      );
    }
    return (
      <span className="text-[11px] text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 rounded-full font-medium">
        Source: Detected from transaction history
      </span>
    );
  };

  // Find source transaction if linked
  const findLinkedTransaction = (txId?: string) => {
    if (!txId) return null;
    return transactions.find(t => t.id === txId);
  };

  return (
    <div className="max-w-4xl space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Bills & Commitments 🧾</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Track recurring payments, EMIs, and upcoming financial commitments.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-emerald-500/25"
        >
          <Plus size={16} />
          Add Bill
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* A. Upcoming This Month */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Upcoming This Month</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {allCommitments.length > 0 ? `₹${upcomingThisMonthTotal.toLocaleString()}` : '₹0'}
              </p>
            </div>
          </div>
          {allCommitments.length === 0 && (
            <p className="text-[11px] text-slate-400 mt-2">No recurring commitments detected yet.</p>
          )}
        </div>

        {/* B. Recurring Payments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-500 flex items-center justify-center flex-shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Recurring Payments</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{recurringCount}</p>
            </div>
          </div>
          {recurringCount === 0 && (
            <p className="text-[11px] text-slate-400 mt-2">No active subscriptions detected.</p>
          )}
        </div>

        {/* C. EMIs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-500 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">EMIs</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{emiCount}</p>
            </div>
          </div>
          {emiCount === 0 && (
            <p className="text-[11px] text-slate-400 mt-2">No active EMI commitments.</p>
          )}
        </div>

        {/* D. Next Payment */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Next Payment</p>
              {nextPayment ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{nextPayment.name}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    ₹{nextPayment.amount.toLocaleString()} ({nextPayment.nextExpectedDate || nextPayment.dueDate})
                  </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-slate-900 dark:text-white">None</p>
              )}
            </div>
          </div>
          {!nextPayment && (
            <p className="text-[11px] text-slate-400 mt-2">No upcoming payments scheduled.</p>
          )}
        </div>
      </div>

      {/* Unconfirmed EMI Alert Banner */}
      {allCommitments.some(c => c.status === 'needs_confirmation') && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Possible EMI Detected from Transaction History
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-0.5">
                We found loan/EMI transaction patterns. Confirming will save it into your persistent EMI tracker.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('emi')}
            className="text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-900 px-3 py-1.5 rounded-xl transition-colors flex-shrink-0"
          >
            Review & Confirm
          </button>
        </div>
      )}

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
          {[
            { key: 'all', label: 'All Commitments' },
            { key: 'upcoming', label: 'Upcoming' },
            { key: 'recurring', label: 'Recurring Payments' },
            { key: 'emi', label: 'EMIs' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search commitments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* Main Content List */}
      {filteredCommitments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {transactions.length === 0 ? 'No commitments yet' : 'No recurring payments detected yet.'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
              {transactions.length === 0
                ? 'Import transactions or add a bill to start tracking your recurring financial commitments.'
                : 'No recurring payment or EMI patterns found in your imported transaction history. You can add bills manually anytime.'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Plus size={14} /> Add Bill
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCommitments.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedCommitment(c)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                  {c.emoji || '📄'}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{c.name}</p>
                    <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                      {c.frequency}
                    </span>
                    <span className="text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {c.category}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Expected around <strong>{c.nextExpectedDate || c.dueDate}</strong>
                    </span>
                    {renderSourceLabel(c)}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-base font-bold text-slate-900 dark:text-white">₹{c.amount.toLocaleString()}</p>
                  <p className="text-[11px] text-slate-400">per {c.frequency.toLowerCase()}</p>
                </div>

                {c.status === 'needs_confirmation' ? (
                  <button
                    onClick={(e) => handleConfirmEMI(c, e)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors shadow-xs"
                  >
                    Confirm as EMI
                  </button>
                ) : (
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    c.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : c.status === 'overdue'
                      ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                      : 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'
                  }`}>
                    {c.status === 'paid' ? 'Paid' : c.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============================================================ */}
      {/* NATIVE SHARED EXPENSES / SPLITWISE-STYLE SECTION            */}
      {/* ============================================================ */}
      <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Shared Expenses</h2>
              <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Splitwise Native
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Split dinners, trips, and group bills seamlessly with registered MoneyMate friends.
            </p>
          </div>

          <button
            onClick={() => {
              setSharedError('');
              setShowAddSharedModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <Plus size={16} /> Add Shared Expense
          </button>
        </div>

        {/* Summary Cards: You Owe vs Owed To You */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total You Owe</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              ₹{sharedSummary.totalYouOwe.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Pending payments to friends</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Owed To You</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{sharedSummary.totalOwedToYou.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Pending receivables from friends</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balances</p>
            {sharedSummary.netBalances.length === 0 ? (
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">All settled up! 🎉</p>
            ) : (
              <div className="space-y-1.5 mt-2 max-h-20 overflow-y-auto">
                {sharedSummary.netBalances.map((nb, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{nb.name}</span>
                    {nb.netAmount > 0 ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">owes you ₹{Math.abs(nb.netAmount)}</span>
                    ) : nb.netAmount < 0 ? (
                      <span className="font-bold text-rose-500">you owe ₹{Math.abs(nb.netAmount)}</span>
                    ) : (
                      <span className="text-slate-400">settled</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Shared Expenses List */}
        {sharedExpenses.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mx-auto text-2xl">
              🤝
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No shared expenses yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Split dinner, rent, or vacation expenses with your registered MoneyMate friends. Enter their email to automatically calculate equal splits!
            </p>
            <button
              onClick={() => {
                setSharedError('');
                setShowAddSharedModal(true);
              }}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
            >
              <Plus size={14} /> Add First Shared Expense
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding & Recent Shared Expenses</p>
            {sharedExpenses.map(item => {
              const currentEmail = (dataStore.getActiveEmail() || '').toLowerCase().trim();
              const isPayer = (item.paidBy?.email || '').toLowerCase().trim() === currentEmail || item.paidById === currentEmail;
              const mySplit = item.splits?.find(s => (s.user?.email || '').toLowerCase().trim() === currentEmail || s.userId === currentEmail);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedShared(item)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl flex-shrink-0 font-bold">
                      💳
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{item.description}</p>
                        <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                          {item.category || 'General'}
                        </span>
                        {item.settled && (
                          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                            Settled
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Total: <strong>₹{item.amount.toLocaleString()}</strong> • Paid by {isPayer ? 'You' : item.paidBy?.name || 'Friend'} • {item.splits?.length || 2} people
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-right">
                      {isPayer ? (
                        <div>
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Others owe you ₹{(item.amount - (mySplit?.amount || 0)).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400">Your share: ₹{mySplit?.amount || 0}</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-bold text-rose-500">
                            You owe ₹{mySplit?.amount || 0}
                          </p>
                          <p className="text-[10px] text-slate-400">to {item.paidBy?.name || 'Friend'}</p>
                        </div>
                      )}
                    </div>

                    {!item.settled && (
                      <button
                        onClick={(e) => handleSettleUp(item.id, e)}
                        className="bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
                      >
                        Settle Up
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Shared Expense Modal */}
      {showAddSharedModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  🤝
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Shared Expense</h3>
              </div>
              <button onClick={() => setShowAddSharedModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {sharedError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{sharedError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSharedExpense} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Team Dinner, Goa Hotel, Electricity Bill"
                  value={sharedForm.description}
                  onChange={e => setSharedForm({ ...sharedForm, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={sharedForm.amount}
                    onChange={e => setSharedForm({ ...sharedForm, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={sharedForm.category}
                    onChange={e => setSharedForm({ ...sharedForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Food & Dining">Food & Dining</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Travel">Travel</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Shopping">Shopping</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Split With (Registered MoneyMate Friend's Email)</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="e.g. urshita@example.com"
                    value={sharedForm.participantInput}
                    onChange={e => setSharedForm({ ...sharedForm, participantInput: e.target.value })}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddParticipantEmail();
                      }
                    }}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipantEmail}
                    className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1"
                  >
                    <UserPlus size={14} /> Add
                  </button>
                </div>

                {/* Added participants chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1">
                    You (Payer)
                  </span>
                  {sharedForm.participantEmails.map((email, idx) => (
                    <span
                      key={idx}
                      className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-full text-[11px] flex items-center gap-1"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipantEmail(email)}
                        className="text-slate-400 hover:text-rose-500 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Split Preview Box */}
              {Number(sharedForm.amount) > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <p className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">Equal Split Preview</p>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Total ₹{Number(sharedForm.amount).toLocaleString()} ÷ {sharedForm.participantEmails.length + 1} people ={' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      ₹{(Math.round((Number(sharedForm.amount) / (sharedForm.participantEmails.length + 1)) * 100) / 100).toLocaleString()} each
                    </strong>
                  </p>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddSharedModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShared}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  {isSubmittingShared ? 'Creating Split...' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Shared Expense Details Modal */}
      {selectedShared && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  💳
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedShared.description}</h3>
                  <span className="text-[11px] text-slate-400">{selectedShared.category || 'General'}</span>
                </div>
              </div>
              <button onClick={() => setSelectedShared(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Total Expense</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">₹{selectedShared.amount.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Paid By</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{selectedShared.paidBy?.name || 'User'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Equal Split Breakdown</p>
                <div className="space-y-1.5 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                  {selectedShared.splits?.map((split, i) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b last:border-b-0 border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{split.user?.name || split.userId}</p>
                        <p className="text-[10px] text-slate-400">{split.user?.email}</p>
                      </div>
                      <p className="font-bold text-slate-900 dark:text-white">₹{split.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedShared(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-200"
              >
                Close
              </button>
              {!selectedShared.settled && (
                <button
                  onClick={(e) => handleSettleUp(selectedShared.id, e)}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs"
                >
                  Mark as Settled
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  ➕
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Manual Bill / Commitment</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddBillSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Bill / Commitment Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Internet Bill, Rent, Insurance"
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    placeholder="e.g. 1499"
                    value={addForm.amount}
                    onChange={e => setAddForm({ ...addForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={addForm.dueDate}
                    onChange={e => setAddForm({ ...addForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Frequency *
                  </label>
                  <select
                    value={addForm.frequency}
                    onChange={e => setAddForm({ ...addForm, frequency: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Yearly">Yearly</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={addForm.category}
                    onChange={e => setAddForm({ ...addForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Utilities">Utilities</option>
                    <option value="Subscriptions">Subscriptions</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Loans & EMIs">Loans & EMIs</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Optional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Account No. or Reminder detail"
                  value={addForm.notes}
                  onChange={e => setAddForm({ ...addForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Commitment Details Modal */}
      {selectedCommitment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedCommitment.emoji || '📄'}</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedCommitment.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCommitment.category}</p>
                </div>
              </div>
              <button onClick={() => setSelectedCommitment(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{selectedCommitment.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400">Frequency</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{selectedCommitment.frequency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400 text-[11px]">Expected Due Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedCommitment.nextExpectedDate || selectedCommitment.dueDate || 'N/A'}
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400 text-[11px]">Last Payment Date</p>
                  <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {selectedCommitment.lastPaidDate || 'None recorded'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl space-y-1">
                <p className="text-slate-400 text-[11px]">Data Source</p>
                <div>{renderSourceLabel(selectedCommitment)}</div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedCommitment.source === 'transaction_history'
                    ? 'Automatically identified from historical bank transaction pattern recognition.'
                    : selectedCommitment.source === 'user_confirmed'
                    ? 'Manually verified and confirmed by user into official commitment ledger.'
                    : 'Created manually by user.'}
                </p>
              </div>

              {selectedCommitment.sourceTransactionId && (
                <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/40 p-3 rounded-xl text-sky-800 dark:text-sky-300">
                  <p className="font-semibold text-[11px]">Linked Source Transaction</p>
                  {(() => {
                    const tx = findLinkedTransaction(selectedCommitment.sourceTransactionId);
                    return tx ? (
                      <p className="text-[11px] mt-0.5">
                        Matched: <strong>{tx.merchant}</strong> (₹{tx.amount}) on {tx.date}
                      </p>
                    ) : (
                      <p className="text-[11px] mt-0.5">Transaction ID: {selectedCommitment.sourceTransactionId}</p>
                    );
                  })()}
                </div>
              )}

              {selectedCommitment.notes && (
                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                  <p className="text-slate-400 text-[11px]">Notes</p>
                  <p className="text-slate-800 dark:text-slate-200">{selectedCommitment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedCommitment(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs"
              >
                Close
              </button>
              <button
                onClick={(e) => handleDeleteCommitment(selectedCommitment.id, e)}
                className="px-4 py-2.5 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs flex items-center gap-1"
              >
                <Trash2 size={14} /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
