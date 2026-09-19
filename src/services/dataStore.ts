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

  // --- TRANSACTIONS ---
  public getTransactions(): TransactionItem[] {
    const data = this.getData();
    return data.transactions || [];
  }

  public addTransaction(tx: Omit<TransactionItem, 'id' | 'createdAt'>): TransactionItem {
    const data = this.getData();
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
      createdAt: new Date().toISOString(),
    };

    data.transactions = [newTx, ...(data.transactions || [])];

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
      if (txRes && txRes.success && Array.isArray(txRes.transactions) && txRes.transactions.length > 0) {
        const localTxs: TransactionItem[] = data.transactions || [];
        const localIds = new Set(localTxs.map(t => t.id));

        for (const remoteTx of txRes.transactions) {
          if (!localIds.has(remoteTx.id)) {
            localTxs.push({
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
            });
          }
        }
        data.transactions = localTxs;
      } else if ((data.transactions || []).length > 0) {
        // Push local transactions to backend if backend lost them
        for (const localTx of data.transactions) {
          api.transactions.create(localTx).catch(() => {});
        }
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
