import { TransactionItem, CommitmentItem } from './dataStore';

const EMI_KEYWORDS = [
  'emi', 'loan', 'bajaj', 'hdfc loan', 'sbi loan', 'icici loan',
  'car loan', 'home loan', 'personal loan', 'credit card emi',
  'slice', 'zest', 'muthoot', 'mortgage', 'finance', 'nbfc', 'cred'
];

const RECURRING_KEYWORDS: Record<string, { emoji: string; category: string }> = {
  netflix: { emoji: '📺', category: 'Entertainment' },
  spotify: { emoji: '🎵', category: 'Entertainment' },
  prime: { emoji: '📦', category: 'Entertainment' },
  airtel: { emoji: '📱', category: 'Utilities' },
  jio: { emoji: '📱', category: 'Utilities' },
  vi: { emoji: '📱', category: 'Utilities' },
  wifi: { emoji: '🌐', category: 'Utilities' },
  broadband: { emoji: '🌐', category: 'Utilities' },
  internet: { emoji: '🌐', category: 'Utilities' },
  electricity: { emoji: '⚡', category: 'Utilities' },
  power: { emoji: '⚡', category: 'Utilities' },
  water: { emoji: '💧', category: 'Utilities' },
  rent: { emoji: '🏠', category: 'Housing' },
  gym: { emoji: '🏋️', category: 'Health & Fitness' },
  cult: { emoji: '🏋️', category: 'Health & Fitness' },
  fitness: { emoji: '🏋️', category: 'Health & Fitness' },
  insurance: { emoji: '🛡️', category: 'Insurance' },
  lic: { emoji: '🛡️', category: 'Insurance' },
  swiggy: { emoji: '🍔', category: 'Subscriptions' },
  zomato: { emoji: '🍕', category: 'Subscriptions' },
  youtube: { emoji: '▶️', category: 'Entertainment' },
  apple: { emoji: '🍎', category: 'Subscriptions' },
  google: { emoji: '🔍', category: 'Subscriptions' },
  icloud: { emoji: '☁️', category: 'Subscriptions' },
};

function parseSafeDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  let d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const year = new Date().getFullYear();
    d = new Date(`${dateStr}, ${year}`);
    if (isNaN(d.getTime())) {
      d = new Date();
    }
  }
  return d;
}

function formatDateSafe(date: Date): string {
  try {
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function detectCommitmentsFromTransactions(
  transactions: TransactionItem[] = [],
  userCommitments: CommitmentItem[] = []
): CommitmentItem[] {
  try {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return userCommitments || [];
    }

    // Filter expense transactions only
    const expenses = transactions.filter(t => t && (t.type === 'expense' || !t.type));
    if (expenses.length === 0) return userCommitments || [];

    // Group by normalized merchant name
    const groups: Record<string, TransactionItem[]> = {};

    for (const tx of expenses) {
      if (!tx) continue;
      const normName = (tx.merchant || tx.description || 'Expense').toLowerCase().trim();
      if (!normName) continue;

      // Standardize key by removing dates/numbers if common pattern
      const cleanKey = normName.replace(/\d{4}/g, '').trim();
      if (!groups[cleanKey]) {
        groups[cleanKey] = [];
      }
      groups[cleanKey].push(tx);
    }

    const detected: CommitmentItem[] = [];

    for (const [key, txList] of Object.entries(groups)) {
      if (!txList || txList.length === 0) continue;

      // Sort transactions newest first
      txList.sort((a, b) => parseSafeDate(b.date).getTime() - parseSafeDate(a.date).getTime());
      const latestTx = txList[0];
      const merchantName = latestTx.merchant || latestTx.description || 'Recurring Payment';
      const normName = merchantName.toLowerCase();

      // Check if this merchant matches EMI keywords
      const isEmiKeyword = EMI_KEYWORDS.some(k => normName.includes(k));

      // Check if merchant matches known recurring subscription keywords
      const matchedRec = Object.entries(RECURRING_KEYWORDS).find(([k]) => normName.includes(k));

      const count = txList.length;

      // Calculate interval between transactions if count >= 2
      let daysDiff = 30;
      if (count >= 2) {
        const dates = txList.map(t => parseSafeDate(t.date).getTime()).sort((a, b) => b - a);
        const diffs: number[] = [];
        for (let i = 0; i < dates.length - 1; i++) {
          const diffDays = Math.round((dates[i] - dates[i + 1]) / (1000 * 3600 * 24));
          if (diffDays > 0) diffs.push(diffDays);
        }
        if (diffs.length > 0) {
          daysDiff = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
        }
      }

      // Determine frequency
      let frequency: 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly' = 'Monthly';
      if (daysDiff >= 5 && daysDiff <= 10) frequency = 'Weekly';
      else if (daysDiff >= 80 && daysDiff <= 100) frequency = 'Quarterly';
      else if (daysDiff >= 340 && daysDiff <= 390) frequency = 'Yearly';
      else frequency = 'Monthly';

      // Qualify as detection if: count >= 2 OR count === 1 and matches known keyword
      const isQualified = count >= 2 || isEmiKeyword || Boolean(matchedRec);
      if (!isQualified) continue;

      // Check if user already confirmed or added this manually
      const existingUserMatch = (userCommitments || []).find(c =>
        c && c.name && (c.name.toLowerCase().includes(key) || key.includes(c.name.toLowerCase()) || c.sourceTransactionId === latestTx.id)
      );

      if (existingUserMatch) {
        continue;
      }

      // Compute expected next payment date
      const lastDate = parseSafeDate(latestTx.date);
      const nextDate = new Date(lastDate.getTime());

      if (frequency === 'Weekly') nextDate.setDate(nextDate.getDate() + 7);
      else if (frequency === 'Quarterly') nextDate.setMonth(nextDate.getMonth() + 3);
      else if (frequency === 'Yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
      else nextDate.setMonth(nextDate.getMonth() + 1);

      const today = new Date();
      const isPast = nextDate < today;

      let status: 'upcoming' | 'paid' | 'overdue' | 'needs_confirmation' = 'upcoming';
      if (isEmiKeyword) {
        status = 'needs_confirmation';
      } else if (isPast && Math.abs(today.getTime() - nextDate.getTime()) > (7 * 24 * 3600 * 1000)) {
        status = 'overdue';
      }

      const formattedNextDate = formatDateSafe(nextDate);

      // Average amount
      const avgAmount = Math.round(txList.reduce((s, t) => s + Number(t.amount || 0), 0) / count);

      const confidence: 'high' | 'medium' | 'low' =
        count >= 3 || isEmiKeyword ? 'high' : count === 2 ? 'medium' : 'low';

      const category = matchedRec
        ? matchedRec[1].category
        : isEmiKeyword
        ? 'Loans & EMIs'
        : latestTx.category || 'Subscriptions';

      const emoji = matchedRec
        ? matchedRec[1].emoji
        : isEmiKeyword
        ? '🏦'
        : latestTx.emoji || '📄';

      detected.push({
        id: `det_${latestTx.id || Date.now()}`,
        name: merchantName,
        amount: avgAmount,
        currency: 'INR',
        category: category,
        frequency: frequency,
        type: isEmiKeyword ? 'emi' : 'recurring',
        status: status,
        dueDate: formattedNextDate,
        nextExpectedDate: formattedNextDate,
        lastPaidDate: latestTx.date,
        source: 'transaction_history',
        sourceTransactionId: latestTx.id,
        confidence: confidence,
        isConfirmed: false,
        emoji: emoji,
        createdAt: latestTx.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Merge user commitments and detected commitments
    const combined = [...(userCommitments || []), ...detected];

    // Sort by next expected date ascending
    combined.sort((a, b) => {
      const dA = parseSafeDate(a.nextExpectedDate || a.dueDate).getTime();
      const dB = parseSafeDate(b.nextExpectedDate || b.dueDate).getTime();
      return dA - dB;
    });

    return combined;
  } catch (err) {
    console.error('Commitment detection error:', err);
    return userCommitments || [];
  }
}
