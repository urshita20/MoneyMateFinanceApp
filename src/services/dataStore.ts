import { api } from './api';

export interface TransactionItem {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  type: 'income' | 'expense' | 'transfer';
  emoji: string;
  date: string;
  description?: string;
  paymentMethod?: string;
  source?: 'manual' | 'receipt_ocr' | 'bank_import';
  receiptUrl?: string;
  externalTransactionId?: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  emoji?: string;
  color?: string;
}

export interface GoalItem {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  emoji?: string;
  color?: string;
  progressPercent: number;
}

export interface UserProfile {
  name: string;
  email: string;
  monthlyIncome: number;
  monthlyBudget: number;
  savingsTarget: number;
  hasCompletedSetup: boolean;
}

class DataStoreManager {
  private activeEmail: string = '';

  public setActiveUser(email: string, name?: string) {
    if (!email) return;
    this.activeEmail = email.toLowerCase().trim();

    // Ensure initial storage structure exists
    const key = this.getStorageKey();
    const existing = localStorage.getItem(key);
    if (!existing) {
      const initial = {
        profile: {
          name: name || email.split('@')[0],
          email: this.activeEmail,
          monthlyIncome: 0,
          monthlyBudget: 0,
          savingsTarget: 0,
          hasCompletedSetup: false,
        },
        transactions: [],
        budgets: [],
        goals: [],
      };
      localStorage.setItem(key, JSON.stringify(initial));
    } else if (name) {
      const data = JSON.parse(existing);
      if (!data.profile.name || data.profile.name === 'User') {
        data.profile.name = name;
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
  }

  public getActiveEmail(): string {
    if (this.activeEmail) return this.activeEmail;
    // Fallback: check stored token or last user
    const lastEmail = localStorage.getItem('moneymate_last_email');
    if (lastEmail) {
      this.activeEmail = lastEmail;
      return lastEmail;
    }
    return '';
  }

  private getStorageKey(): string {
    const email = this.getActiveEmail() || 'default_user';
    return `moneymate_store_${email}`;
  }

  private getData() {
    const key = this.getStorageKey();
    const raw = localStorage.getItem(key);
    if (!raw) {
      return {
        profile: {
          name: 'User',
          email: this.activeEmail,
          monthlyIncome: 0,
          monthlyBudget: 0,
          savingsTarget: 0,
          hasCompletedSetup: false,
        },
        transactions: [] as TransactionItem[],
        budgets: [] as BudgetItem[],
        goals: [] as GoalItem[],
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        profile: {
          name: 'User',
          email: this.activeEmail,
          monthlyIncome: 0,
          monthlyBudget: 0,
          savingsTarget: 0,
          hasCompletedSetup: false,
        },
        transactions: [],
        budgets: [],
        goals: [],
      };
    }
  }

  private saveData(data: any) {
    const key = this.getStorageKey();
    localStorage.setItem(key, JSON.stringify(data));
    if (this.activeEmail) {
      localStorage.setItem('moneymate_last_email', this.activeEmail);
    }
  }

  // --- USER PROFILE ---
  public getProfile(): UserProfile {
    const data = this.getData();
    return data.profile || {
      name: 'User',
      email: this.activeEmail,
      monthlyIncome: 0,
      monthlyBudget: 0,
      savingsTarget: 0,
      hasCompletedSetup: false,
    };
  }

  public updateProfile(setup: { monthlyIncome: number; monthlyBudget: number; savingsTarget?: number }) {
    const data = this.getData();
    data.profile = {
      ...data.profile,
      monthlyIncome: setup.monthlyIncome,
      monthlyBudget: setup.monthlyBudget,
      savingsTarget: setup.savingsTarget || 0,
      hasCompletedSetup: true,
    };
    this.saveData(data);
  }

  private deduplicateTransactions(transactions: TransactionItem[]): TransactionItem[] {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const map = new Map<string, TransactionItem>();
    const result: TransactionItem[] = [];

    for (const tx of transactions) {
      if (!tx) continue;
      // Skip exact ID matches
      if (result.some(t => t.id === tx.id)) continue;

      const normMerchant = (tx.merchant || '').toLowerCase().trim();
      const normCategory = (tx.category || '').toLowerCase().trim();
      const dateStr = (tx.date || '').split('T')[0];
      const amountNum = Number(tx.amount || 0);
      const typeStr = tx.type || 'expense';

      const sigKey = `${normMerchant}_${amountNum.toFixed(2)}_${normCategory}_${typeStr}_${dateStr}`;

      if (!map.has(sigKey)) {
        map.set(sigKey, tx);
        result.push(tx);
      } else {
        const existing = map.get(sigKey)!;
        // Prefer remote GUID id over temporary local id (tx_...)
        if (existing.id.startsWith('tx_') && !tx.id.startsWith('tx_')) {
          const idx = result.findIndex(t => t.id === existing.id);
          if (idx !== -1) {
            result[idx] = tx;
          }
          map.set(sigKey, tx);
        }
      }
    }

    return result;
  }

  // --- TRANSACTIONS ---
  public getTransactions(): TransactionItem[] {
    const data = this.getData();
    const rawTxs = data.transactions || [];
    const deduped = this.deduplicateTransactions(rawTxs);
    if (deduped.length !== rawTxs.length) {
      data.transactions = deduped;
      this.saveData(data);
    }
    return deduped;
  }

  public addTransaction(tx: Omit<TransactionItem, 'id' | 'createdAt'>): TransactionItem {
    const data = this.getData();
    const existingTxs: TransactionItem[] = data.transactions || [];

    const normMerchant = (tx.merchant || '').toLowerCase().trim();
    const normCategory = (tx.category || '').toLowerCase().trim();
    const dateStr = (tx.date || '').split('T')[0];
    const amountNum = Number(tx.amount || 0);
    const typeStr = tx.type || 'expense';
    const sigKey = `${normMerchant}_${amountNum.toFixed(2)}_${normCategory}_${typeStr}_${dateStr}`;

    const duplicate = existingTxs.find(existing => {
      const eMerchant = (existing.merchant || '').toLowerCase().trim();
      const eCategory = (existing.category || '').toLowerCase().trim();
      const eDate = (existing.date || '').split('T')[0];
      const eAmount = Number(existing.amount || 0);
      const eType = existing.type || 'expense';
      return `${eMerchant}_${eAmount.toFixed(2)}_${eCategory}_${eType}_${eDate}` === sigKey;
    });

    if (duplicate) {
      return duplicate;
    }

    const newTx: TransactionItem = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      merchant: tx.merchant,
      amount: Number(tx.amount),
      category: tx.category,
      type: tx.type || 'expense',
      emoji: tx.emoji || '💸',
      date: tx.date || new Date().toISOString().split('T')[0],
      description: tx.description || '',
      paymentMethod: tx.paymentMethod || 'UPI',
      source: tx.source || 'manual',
      receiptUrl: tx.receiptUrl || '',
      externalTransactionId: tx.externalTransactionId || '',
      createdAt: new Date().toISOString(),
    };

    data.transactions = [newTx, ...existingTxs];

    // Update spentAmount on category budget if expense
    if (newTx.type === 'expense' && data.budgets) {
      const idx = data.budgets.findIndex((b: BudgetItem) => b.category === newTx.category);
      if (idx !== -1) {
        data.budgets[idx].spentAmount = (data.budgets[idx].spentAmount || 0) + newTx.amount;
      }
    }

    this.saveData(data);
    return newTx;
  }

  public extractOcrAmount(rawText: string): string {
    if (!rawText) return '';

    // Normalize OCR text: fix common OCR character misreadings (.OO -> .00, .Oo -> .00, l50 -> 150)
    let text = rawText
      .replace(/(\d+)\s*\.\s*([OoSs0-9]{2})/g, (m, g1, g2) => {
        const cleanG2 = g2.replace(/[OoSs]/g, '0');
        return `${g1}.${cleanG2}`;
      })
      .replace(/\b[lI](\d+[\.\,]\d+)\b/g, '1$1')
      .replace(/\b(\d+[\.\,])[lI]\b/g, '$10')
      .replace(/([0-9]+)\s*\/[-=]/g, '$1');

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

    // High Priority Keywords (grand totals / bill amounts / total due)
    const totalKeywords = [
      /grand\s+total/i,
      /total\s+due/i,
      /bill\s+amt/i,
      /bill\s+amount/i,
      /total\s+amount/i,
      /net\s+amount/i,
      /net\s+payable/i,
      /amount\s+payable/i,
      /total\s+payable/i,
      /amount\s+due/i,
      /total\s+paid/i,
      /amount\s+paid/i,
      /final\s+total/i,
      /\bnet\s+total\b/i,
      /\btotal\b/i,
      /\bamount\b/i,
      /\bamt\b/i,
    ];

    const extractNumbersFromLine = (line: string): number[] => {
      // Ignore lines with GSTIN, CIN, Phone, Mobile, or PIN Code
      if (/gstin|cin\b|fssai|phone|mobile|tel\b|pin\s*code|account|acc\s*no/i.test(line)) {
        return [];
      }

      const matches = line.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+\.?[0-9]*)/gi);
      if (!matches) return [];

      const numbers: number[] = [];
      for (const m of matches) {
        const clean = m.replace(/[^0-9.]/g, '');
        if (!clean) continue;
        const val = parseFloat(clean);
        if (!isNaN(val) && val > 0 && val < 500000) {
          // Ignore 4-digit years like 2024, 2025, 2026 if integer without decimal
          if (val >= 2020 && val <= 2030 && !clean.includes('.')) continue;
          // Ignore 6-digit PIN codes or reference numbers without decimals
          if (val >= 100000 && val <= 999999 && !clean.includes('.')) continue;
          numbers.push(val);
        }
      }
      return numbers;
    };

    // 1. Line-by-line scanning for total keywords (bottom-up)
    for (const kw of totalKeywords) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (kw.test(line)) {
          const nums = extractNumbersFromLine(line);
          if (nums.length > 0) {
            // Take the MAX positive number on this total line
            const maxVal = Math.max(...nums);
            if (maxVal > 0) {
              return maxVal.toString();
            }
          }
        }
      }
    }

    // 2. Scan for explicit 2-decimal numbers across lines (e.g. 150.00)
    const decimalNumbers: number[] = [];
    for (const line of lines) {
      if (/gstin|cin\b|fssai|phone|mobile|tel\b|pin\s*code/i.test(line)) continue;
      const matches = line.match(/(?:₹|rs\.?|inr)?\s*([0-9,]+\.[0-9]{2})/gi);
      if (matches) {
        for (const m of matches) {
          const val = parseFloat(m.replace(/[^0-9.]/g, ''));
          if (!isNaN(val) && val > 0 && val < 500000) {
            decimalNumbers.push(val);
          }
        }
      }
    }

    if (decimalNumbers.length > 0) {
      return Math.max(...decimalNumbers).toString();
    }

    // 3. Global scan across all lines for any valid numbers
    const allValidNumbers: number[] = [];
    for (const line of lines) {
      const nums = extractNumbersFromLine(line);
      for (const n of nums) {
        allValidNumbers.push(n);
      }
    }

    if (allValidNumbers.length > 0) {
      return Math.max(...allValidNumbers).toString();
    }

    return '';
  }

  // --- USER LEARNED CATEGORY CORRECTIONS ---
  private getLearnedCategories(): Record<string, string> {
    try {
      const stored = localStorage.getItem('moneymate_learned_categories');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  public learnUserCategory(merchant: string, category: string) {
    if (!merchant || !category || category === 'Uncategorized') return;
    try {
      const learned = this.getLearnedCategories();
      const normKey = merchant.toLowerCase().trim();
      learned[normKey] = category;
      localStorage.setItem('moneymate_learned_categories', JSON.stringify(learned));
    } catch (e) {
      console.warn('Could not save learned category', e);
    }
  }

  public categorizeMerchant(merchant: string, description: string = '', amount: number = 0, type: string = 'expense'): { category: string; emoji: string } {
    if (type === 'income') {
      const incText = `${merchant} ${description}`.toLowerCase();
      if (/interest|div|dividend|int\.pd/i.test(incText)) {
        return { category: 'Freelance', emoji: '📈' };
      }
      return { category: 'Salary', emoji: '💰' };
    }

    const text = `${merchant} ${description}`.toLowerCase().trim();
    if (!text) return { category: 'Other', emoji: '📦' };

    // 1. Check User Learned Corrections
    const learned = this.getLearnedCategories();
    for (const key in learned) {
      if (text.includes(key) || key.includes(text)) {
        const userCat = learned[key];
        const emojiMap: Record<string, string> = {
          'Food & Dining': '🍕',
          'Transport': '🚗',
          'Shopping': '🛍️',
          'Utilities': '⚡',
          'Groceries': '🛒',
          'Health': '💊',
          'Entertainment': '🎬',
          'Education': '📚',
          'Housing': '🏠',
          'Salary': '💰',
          'Freelance': '💼',
          'Other': '🏷️',
        };
        return { category: userCat, emoji: emojiMap[userCat] || '🏷️' };
      }
    }

    // 2. Comprehensive Heuristic Patterns for Bank Narrations & Merchant Names
    // Food & Dining
    if (/swiggy|zomato|ccd|cafe|coffee|day|starbucks|mcdonald|mcd\b|kfc|domino|pizza|diner|restaurant|canteen|eatery|baking|bakery|biryani|burger|lunch|dinner|breakfast|tea\b|chai\b|bar\b|pub\b|bistro|haldiram|bikanervala|behrouz|faasos|ovenstory|subway|dunkin|taco|barbeque|bbq|sweet|food/i.test(text)) {
      return { category: 'Food & Dining', emoji: '🍕' };
    }

    // Transport
    if (/uber|ola|rapido|metro|bmrtc|dmrc|railway|irctc|train|bus|redbus|abhibus|cab|taxi|auto|petrol|fuel|diesel|shell|hpcl|bpcl|iocl|oil|toll|fastag|park\+|parking|airline|indigo|air india|spicejet|vistara|akasa|ride/i.test(text)) {
      return { category: 'Transport', emoji: '🚗' };
    }

    // Shopping
    if (/amazon|amzn|mktp|flipkart|myntra|ajio|meesho|nykaa|zara|h&m|hnm|decathlon|uniqlo|trends|shoppers|pantaloons|westside|max\b|tata cliq|croma|vijay sales|reliance digital|apple|lenskart|fashion|clothing|footwear|store|mall|bazaar|pos txn|retail/i.test(text)) {
      return { category: 'Shopping', emoji: '🛍️' };
    }

    // Utilities
    if (/electricity|bescom|tatapower|tata power|cesc|uppcl|mseb|torrent|power|water|jal|gas|indane|hp gas|bharat gas|utility|airtel|jio|vi\b|vodafone|idea|broadband|act fibernet|bsnl|recharge|dth|tata play|dish tv|sun direct/i.test(text)) {
      return { category: 'Utilities', emoji: '⚡' };
    }

    // Groceries
    if (/blinkit|zepto|instamart|bigbasket|grofers|dmart|supermarket|grocery|hypermarket|spencer|more megastore|nature basket|reliance fresh|milk|dairy|country delight|freshtohome|licious|mart/i.test(text)) {
      return { category: 'Groceries', emoji: '🛒' };
    }

    // Health / Healthcare
    if (/pharmacy|apollo|1mg|netmeds|pharmeasy|hospital|doctor|clinic|medical|health|diagnostic|lab|pathology|dr\.|medplus|practo|cult\.fit|gym|fitness/i.test(text)) {
      return { category: 'Health', emoji: '💊' };
    }

    // Entertainment
    if (/netflix|spotify|pvr|inox|cinepolis|movie|cinema|bookmyshow|bms|hotstar|prime video|youtube|premium|game|steam|playstation|xbox|nintendo|apple music|gaana|saavn|wynk|event/i.test(text)) {
      return { category: 'Entertainment', emoji: '🎬' };
    }

    // Education
    if (/udemy|coursera|unacademy|byju|simplilearn|upgrad|school|college|university|tuition|books|stationery|course|exam|fee|fees|coaching|library/i.test(text)) {
      return { category: 'Education', emoji: '📚' };
    }

    // Housing
    if (/rent|landlord|society|maintenance|housing|apartment|flat|brokerage|deposit/i.test(text)) {
      return { category: 'Housing', emoji: '🏠' };
    }

    // Smart Keyword Fallbacks for Bank Narrations
    if (/pos\s*txn|atm\s*wdl|cash\s*wdl/i.test(text)) {
      return { category: 'Other', emoji: '💳' };
    }

    if (/upi|neft|imps|rtgs|ach|bil/i.test(text)) {
      return { category: 'Other', emoji: '📱' };
    }

    return { category: 'Other', emoji: '📦' };
  }

  public checkDuplicate(tx: { merchant: string; amount: number; date: string; externalTransactionId?: string }): { isDuplicate: boolean; existingTx?: TransactionItem } {
    const transactions = this.getTransactions();
    const dateStr = (tx.date || '').split('T')[0];
    const amountNum = Number(tx.amount || 0);
    const normMerchant = (tx.merchant || '').toLowerCase().trim();

    const existing = transactions.find(existingTx => {
      if (tx.externalTransactionId && existingTx.externalTransactionId === tx.externalTransactionId) {
        return true;
      }
      const eDate = (existingTx.date || '').split('T')[0];
      const eAmount = Number(existingTx.amount || 0);
      const eMerchant = (existingTx.merchant || '').toLowerCase().trim();

      const sameDate = eDate === dateStr;
      const sameAmount = Math.abs(eAmount - amountNum) < 0.01;
      const sameMerchant = eMerchant.includes(normMerchant) || normMerchant.includes(eMerchant);

      return sameDate && sameAmount && sameMerchant;
    });

    return {
      isDuplicate: Boolean(existing),
      existingTx: existing,
    };
  }

  public addBatchTransactions(items: Omit<TransactionItem, 'id' | 'createdAt'>[]): TransactionItem[] {
    const added: TransactionItem[] = [];
    for (const item of items) {
      const created = this.addTransaction(item);
      added.push(created);
    }
    // Also trigger background POST to backend
    api.transactions.createBatch(added).catch(console.warn);
    return added;
  }

  public deleteTransaction(id: string) {
    const data = this.getData();
    const tx = (data.transactions || []).find((t: TransactionItem) => t.id === id);
    data.transactions = (data.transactions || []).filter((t: TransactionItem) => t.id !== id);

    if (tx && tx.type === 'expense' && data.budgets) {
      const idx = data.budgets.findIndex((b: BudgetItem) => b.category === tx.category);
      if (idx !== -1) {
        data.budgets[idx].spentAmount = Math.max(0, (data.budgets[idx].spentAmount || 0) - tx.amount);
      }
    }

    this.saveData(data);
  }

  // --- BUDGETS ---
  public getBudgets(): BudgetItem[] {
    const data = this.getData();
    const transactions: TransactionItem[] = data.transactions || [];

    // Recalculate spent amounts dynamically
    return (data.budgets || []).map((b: BudgetItem) => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spentAmount: spent };
    });
  }

  public addCategoryBudget(b: { category: string; budgetAmount: number; emoji?: string }): BudgetItem {
    const data = this.getData();
    const budgets: BudgetItem[] = data.budgets || [];
    const idx = budgets.findIndex(item => item.category === b.category);

    const transactions: TransactionItem[] = data.transactions || [];
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const newBudget: BudgetItem = {
      id: idx !== -1 ? budgets[idx].id : `b_${Date.now()}`,
      category: b.category,
      budgetAmount: Number(b.budgetAmount),
      spentAmount: spent,
      emoji: b.emoji || '📊',
    };

    if (idx !== -1) {
      budgets[idx] = newBudget;
    } else {
      budgets.push(newBudget);
    }

    data.budgets = budgets;
    this.saveData(data);
    return newBudget;
  }

  // --- GOALS ---
  public getGoals(): GoalItem[] {
    const data = this.getData();
    return (data.goals || []).map((g: GoalItem) => ({
      ...g,
      progressPercent: g.targetAmount > 0 ? Math.min(100, Math.round((g.savedAmount / g.targetAmount) * 100)) : 0,
    }));
  }

  public addGoal(g: { name: string; targetAmount: number; deadline: string; emoji?: string }): GoalItem {
    const data = this.getData();
    const newGoal: GoalItem = {
      id: `g_${Date.now()}`,
      name: g.name,
      targetAmount: Number(g.targetAmount),
      savedAmount: 0,
      deadline: g.deadline,
      emoji: g.emoji || '🎯',
      progressPercent: 0,
    };
    data.goals = [...(data.goals || []), newGoal];
    this.saveData(data);
    return newGoal;
  }

  public depositGoal(id: string, amount: number) {
    const data = this.getData();
    const idx = (data.goals || []).findIndex((g: GoalItem) => g.id === id);
    if (idx !== -1) {
      data.goals[idx].savedAmount += Number(amount);
      data.goals[idx].progressPercent = data.goals[idx].targetAmount > 0
        ? Math.min(100, Math.round((data.goals[idx].savedAmount / data.goals[idx].targetAmount) * 100))
        : 0;
      this.saveData(data);
    }
  }

  public deleteGoal(id: string) {
    const data = this.getData();
    data.goals = (data.goals || []).filter((g: GoalItem) => g.id !== id);
    this.saveData(data);
  }

  // --- SUMMARY CALCULATION ---
  public getDashboardSummary() {
    const profile = this.getProfile();
    const transactions = this.getTransactions();
    const goals = this.getGoals();

    const totalIncomeTx = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpenseTx = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const monthlyIncome = profile.monthlyIncome > 0 ? profile.monthlyIncome : totalIncomeTx;
    const monthlyBudget = profile.monthlyBudget || 0;
    const monthlyExpense = totalExpenseTx;
    const savings = Math.max(0, monthlyIncome - monthlyExpense);
    const totalBalance = Math.max(0, monthlyIncome + totalIncomeTx - totalExpenseTx);

    // Calculate Health Score
    let healthScore: number | null = null;
    let healthFactors: any = null;

    if (transactions.length > 0 || monthlyIncome > 0) {
      const savingsRate = monthlyIncome > 0 ? Math.max(0, savings / monthlyIncome) : 0;
      const savingsScore = Math.min(30, Math.round(savingsRate * 100 * 0.5));

      let budgetScore = 20;
      if (monthlyBudget > 0) {
        const ratio = monthlyExpense / monthlyBudget;
        if (ratio <= 0.8) budgetScore = 30;
        else if (ratio <= 1.0) budgetScore = 22;
        else if (ratio <= 1.2) budgetScore = 12;
        else budgetScore = 5;
      }

      const overspentCount = transactions.filter(t => t.type === 'expense' && t.amount > (monthlyIncome * 0.3)).length;
      const overspendingScore = Math.max(5, 20 - (overspentCount * 5));

      const categoriesUsed = new Set(transactions.map(t => t.category)).size;
      const categoryScore = Math.min(20, categoriesUsed * 5);

      healthScore = Math.min(100, savingsScore + budgetScore + overspendingScore + categoryScore);
      healthFactors = {
        savingsDiscipline: savingsScore >= 20 ? 'Good' : savingsScore >= 10 ? 'Moderate' : 'Needs Work',
        budgetAdherence: budgetScore >= 22 ? 'Good' : budgetScore >= 12 ? 'Moderate' : 'Over Budget',
        overspendingRisk: overspendingScore >= 15 ? 'Low' : 'High',
        spendingConsistency: categoryScore >= 15 ? 'Balanced' : 'Concentrated',
      };
    }

    return {
      hasData: transactions.length > 0 || monthlyIncome > 0,
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        savings,
        monthlyBudget,
        savingsTarget: profile.savingsTarget || 0,
        healthScore,
        healthFactors,
        transactionCount: transactions.length,
        recentTransactions: transactions.slice(0, 5),
      },
      transactions,
      goals,
      budgets: this.getBudgets(),
    };
  }

  // --- SYNC WITH BACKEND API ---
  public async syncWithBackend() {
    try {
      const token = localStorage.getItem('moneymate_token');
      if (!token) return;

      const [sumRes, txRes, budgetRes, goalRes, meRes] = await Promise.all([
        api.analytics.getSummary().catch(() => null),
        api.transactions.getAll().catch(() => null),
        api.budgets.getAll().catch(() => null),
        api.goals.getAll().catch(() => null),
        api.auth.getMe().catch(() => null),
      ]);

      const data = this.getData();

      // Sync profile
      if (meRes && meRes.success && meRes.user) {
        if (meRes.user.monthlyIncome > 0 || meRes.user.monthlyBudget > 0) {
          data.profile.monthlyIncome = meRes.user.monthlyIncome || data.profile.monthlyIncome;
          data.profile.monthlyBudget = meRes.user.monthlyBudget || data.profile.monthlyBudget;
          data.profile.savingsTarget = meRes.user.savingsTarget || data.profile.savingsTarget;
          data.profile.hasCompletedSetup = meRes.user.hasCompletedSetup || data.profile.hasCompletedSetup;
        } else if (data.profile.monthlyIncome > 0) {
          // Push local setup to backend if backend was reset
          api.auth.setup({
            monthlyIncome: data.profile.monthlyIncome,
            monthlyBudget: data.profile.monthlyBudget,
            savingsTarget: data.profile.savingsTarget,
          }).catch(() => {});
        }
      }

      // Sync backend transactions into local store
      if (txRes && txRes.success && Array.isArray(txRes.transactions)) {
        const localTxs: TransactionItem[] = data.transactions || [];
        const normalizedRemote = txRes.transactions.map((remoteTx: any) => ({
          id: remoteTx.id,
          merchant: remoteTx.merchant,
          amount: remoteTx.amount,
          category: remoteTx.category,
          type: remoteTx.type || 'expense',
          emoji: remoteTx.emoji || '💸',
          date: remoteTx.date || new Date().toISOString().split('T')[0],
          description: remoteTx.description || '',
          paymentMethod: remoteTx.paymentMethod || 'UPI',
          createdAt: remoteTx.createdAt || new Date().toISOString(),
        }));
        data.transactions = this.deduplicateTransactions([...normalizedRemote, ...localTxs]);
      }

      // Sync budgets
      if (budgetRes && budgetRes.success && Array.isArray(budgetRes.budgets) && budgetRes.budgets.length > 0) {
        data.budgets = budgetRes.budgets;
      }

      // Sync goals
      if (goalRes && goalRes.success && Array.isArray(goalRes.goals) && goalRes.goals.length > 0) {
        data.goals = goalRes.goals;
      }

      this.saveData(data);
    } catch (err) {
      console.warn('Background sync warning:', err);
    }
  }
}

export const dataStore = new DataStoreManager();
