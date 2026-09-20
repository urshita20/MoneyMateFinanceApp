const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://moneymate-backend-ten.vercel.app';

const getAuthHeaders = () => {
  const token = localStorage.getItem('moneymate_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Auth API
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('moneymate_token', data.token);
      }
      return data;
    },
    register: async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('moneymate_token', data.token);
      }
      return data;
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    setup: async (setupData: { monthlyIncome: number; monthlyBudget: number; savingsTarget?: number }) => {
      const res = await fetch(`${API_BASE_URL}/api/auth/setup`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(setupData),
      });
      return res.json();
    },
    switchProfile: async (profile: 'adult' | 'junior') => {
      return { success: true, profile };
    },
  },


  // Analytics API
  analytics: {
    getSummary: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/summary`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getSpendingByCategory: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/spending-by-category`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getMonthlyTrends: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/monthly-trends`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getWeeklyTrends: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/weekly-trends`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getTimeMachine: async () => {
      const res = await fetch(`${API_BASE_URL}/api/analytics/time-machine`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // Transactions API
  transactions: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (txData: {
      merchant: string;
      amount: number;
      category: string;
      type?: string;
      emoji?: string;
      date?: string;
      description?: string;
      paymentMethod?: string;
      receiptImage?: string;
      source?: string;
      receiptUrl?: string;
      externalTransactionId?: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(txData),
      });
      return res.json();
    },
    createBatch: async (transactions: any[]) => {
      const res = await fetch(`${API_BASE_URL}/api/transactions/batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ transactions }),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    ocrScan: async (imageBase64: string) => {
      const res = await fetch(`${API_BASE_URL}/api/transactions/ocr-scan`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ imageBase64 }),
      });
      return res.json();
    },
  },

  // Budgets API
  budgets: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/budgets`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (budgetData: { category: string; budgetAmount: number; emoji?: string; color?: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/budgets`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(budgetData),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/budgets/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // Goals API
  goals: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (goalData: { name: string; targetAmount: number; deadline: string; emoji?: string; color?: string }) => {
      const res = await fetch(`${API_BASE_URL}/api/goals`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(goalData),
      });
      return res.json();
    },
    deposit: async (id: string, depositAmount: number) => {
      const res = await fetch(`${API_BASE_URL}/api/goals/${id}/deposit`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ depositAmount }),
      });
      return res.json();
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/goals/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // Bills API
  bills: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/bills`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    pay: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/bills/${id}/pay`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // AI API
  ai: {
    chat: async (message: string) => {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message }),
      });
      return res.json();
    },
    getInsights: async () => {
      const res = await fetch(`${API_BASE_URL}/api/ai/insights`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    getDashboard: async () => {
      const res = await fetch(`${API_BASE_URL}/api/ai/dashboard`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },

  // Shared Expenses API
  sharedExpenses: {
    getAll: async () => {
      const res = await fetch(`${API_BASE_URL}/api/expenses/my`, {
        headers: getAuthHeaders(),
      });
      return res.json();
    },
    create: async (data: {
      description: string;
      amount: number;
      participantEmails: string[];
      category?: string;
      groupName?: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      return res.json();
    },
    settle: async (id: string) => {
      const res = await fetch(`${API_BASE_URL}/api/expenses/${id}/settle`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });
      return res.json();
    },
  },
};

