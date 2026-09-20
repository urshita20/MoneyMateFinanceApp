import { useState, useEffect } from 'react';
import {
  Users, Plus, AlertCircle, X, Check, ArrowRightLeft, Clock
} from 'lucide-react';
import { dataStore, SharedExpenseItem, NetContactBalance } from '../services/dataStore';
import { api } from '../services/api';

interface SplitBillProps {
  onNav?: (page: string) => void;
  user?: any;
}

export default function SplitBill({ onNav, user }: SplitBillProps) {
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
    loadSharedExpenses();
    const interval = setInterval(loadSharedExpenses, 4000);
    return () => clearInterval(interval);
  }, [user]);

  const loadSharedExpenses = async () => {
    try {
      const res = await api.sharedExpenses.getAll();
      if (res && res.success && Array.isArray(res.expenses)) {
        setSharedExpenses(res.expenses);
        dataStore.setSharedExpenses(res.expenses);
        if (res.summary) {
          setSharedSummary(res.summary);
        } else {
          setSharedSummary(dataStore.getSharedExpenseSummary());
        }
      } else {
        // Fallback to local store if backend fails
        const local = dataStore.getSharedExpenses();
        if (local.length > 0) {
          setSharedExpenses(local);
          setSharedSummary(dataStore.getSharedExpenseSummary());
        }
      }
    } catch (err) {
      console.warn('Backend shared expense load fallback:', err);
      const local = dataStore.getSharedExpenses();
      if (local.length > 0) {
        setSharedExpenses(local);
        setSharedSummary(dataStore.getSharedExpenseSummary());
      }
    }
  };

  const handleAddParticipantEmail = () => {
    const email = sharedForm.participantInput.trim().toLowerCase();
    if (!email) return;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSharedError('Please enter a valid email address (e.g. friend@example.com)');
      return;
    }

    const currentEmail = (user?.email || dataStore.getActiveEmail() || '').toLowerCase().trim();
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

    const currentEmail = user?.email || dataStore.getActiveEmail() || 'user@moneymate.com';
    const currentName = user?.name || currentEmail.split('@')[0] || 'User';

    const localItem: SharedExpenseItem = {
      id: 'shared_' + Date.now(),
      description: sharedForm.description.trim(),
      amount: amt,
      category: sharedForm.category,
      groupName: sharedForm.groupName,
      paidById: currentEmail,
      paidBy: { id: currentEmail, name: currentName, email: currentEmail },
      settled: false,
      createdAt: new Date().toISOString(),
      splits: [
        {
          id: 'split_payer_' + Date.now(),
          sharedExpenseId: 'shared_' + Date.now(),
          userId: currentEmail,
          user: { id: currentEmail, name: currentName, email: currentEmail },
          amount: Math.round((amt / (sharedForm.participantEmails.length + 1)) * 100) / 100,
          settled: false,
        },
        ...sharedForm.participantEmails.map((email, i) => ({
          id: `split_${i}_` + Date.now(),
          sharedExpenseId: 'shared_' + Date.now(),
          userId: email,
          user: { id: email, name: email.split('@')[0], email },
          amount: Math.round((amt / (sharedForm.participantEmails.length + 1)) * 100) / 100,
          settled: false,
        })),
      ],
    };

    setIsSubmittingShared(true);
    try {
      const res = await api.sharedExpenses.create({
        description: sharedForm.description.trim(),
        amount: amt,
        participantEmails: sharedForm.participantEmails,
        category: sharedForm.category,
        groupName: sharedForm.groupName,
      });

      if (res && res.success && res.expense) {
        dataStore.addSharedExpense(res.expense);
      } else {
        dataStore.addSharedExpense(localItem);
      }
    } catch (err: any) {
      dataStore.addSharedExpense(localItem);
    } finally {
      setShowAddSharedModal(false);
      setSharedForm({
        description: '',
        amount: '',
        category: 'Food & Dining',
        groupName: 'Personal',
        participantInput: '',
        participantEmails: [],
      });
      setIsSubmittingShared(false);
      loadSharedExpenses();
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

  return (
    <div className="max-w-4xl space-y-6" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Split Bill 🤝</h1>
            <span className="text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Splitwise Native
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Split dinners, trips, and group bills seamlessly with registered MoneyMate friends.
          </p>
        </div>

        <button
          onClick={() => {
            setSharedError('');
            setShowAddSharedModal(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/20"
        >
          <Plus size={16} /> Add Shared Expense
        </button>
      </div>

      {/* Summary Cards: You Owe vs Owed To You */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total You Owe</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹{sharedSummary.totalYouOwe.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending payments to friends</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Owed To You</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹{sharedSummary.totalOwedToYou.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pending receivables from friends</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Balances</p>
          {sharedSummary.netBalances.length === 0 ? (
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">All settled up! 🎉</p>
          ) : (
            <div className="space-y-1.5 mt-2 max-h-24 overflow-y-auto">
              {sharedSummary.netBalances.map((nb, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{nb.name || nb.email.split('@')[0]}</span>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center mx-auto text-3xl">
            🤝
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">No shared expenses yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
              Split dinner, rent, or vacation expenses with your registered MoneyMate friends. Enter their email to automatically calculate equal splits!
            </p>
          </div>
          <button
            onClick={() => {
              setSharedError('');
              setShowAddSharedModal(true);
            }}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={14} /> Add First Shared Expense
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding & Recent Shared Expenses</p>
          {sharedExpenses.map(item => {
            const currentUserEmail = (user?.email || dataStore.getActiveEmail() || '').toLowerCase().trim();
            const currentUserId = user?.id || '';

            const isPayer =
              (item.paidBy?.email || '').toLowerCase().trim() === currentUserEmail ||
              item.paidById === currentUserEmail ||
              (currentUserId !== '' && item.paidById === currentUserId);

            const mySplit = item.splits?.find(s =>
              (s.user?.email || '').toLowerCase().trim() === currentUserEmail ||
              s.userId === currentUserEmail ||
              (currentUserId !== '' && s.userId === currentUserId)
            );

            // Calculate exact net amount due
            const netAmountDue = isPayer
              ? item.amount - (mySplit?.amount || 0)
              : (mySplit?.amount || 0);

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

                <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    {item.settled ? (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">All Settled</p>
                    ) : isPayer ? (
                      <div>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          Others owe you ₹{netAmountDue.toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-bold text-rose-500">
                          You owe ₹{netAmountDue.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {!item.settled && (
                    <button
                      onClick={(e) => handleSettleUp(item.id, e)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
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
                    step="0.01"
                    required
                    placeholder="e.g. 1500"
                    value={sharedForm.amount}
                    onChange={e => setSharedForm({ ...sharedForm, amount: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white font-bold"
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
                    <option value="Travel">Travel</option>
                    <option value="Housing & Rent">Housing & Rent</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Participant Email Adder */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Split With Friends (Registered Emails)</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="friend@example.com"
                    value={sharedForm.participantInput}
                    onChange={e => setSharedForm({ ...sharedForm, participantInput: e.target.value })}
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddParticipantEmail}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-3 py-2.5 rounded-xl transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Added Participants Tags */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-slate-500">Expense Participants ({sharedForm.participantEmails.length + 1}):</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1">
                    <Check size={12} /> You (Payer)
                  </span>
                  {sharedForm.participantEmails.map(email => (
                    <span
                      key={email}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1.5"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipantEmail(email)}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Split Preview */}
              {Number(sharedForm.amount) > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Equal Share Per Person:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{Math.round((Number(sharedForm.amount) / (sharedForm.participantEmails.length + 1)) * 100) / 100}
                    </span>
                  </div>
                  {sharedForm.participantEmails.length > 0 && (
                    <p className="text-[10px] text-slate-400">
                      Others owe you ₹{Math.round((Number(sharedForm.amount) - (Number(sharedForm.amount) / (sharedForm.participantEmails.length + 1))) * 100) / 100} in total.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSharedModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingShared}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2 rounded-xl transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmittingShared ? 'Creating...' : 'Create Shared Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
