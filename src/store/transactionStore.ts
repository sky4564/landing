import { create } from "zustand";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  category: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

interface TransactionStore {
  // State
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  selectedDate: Date | null;

  // Actions
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedDate: (date: Date | null) => void;
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: {
    type: TransactionType;
    amount: number;
    description?: string;
    category?: string;
    transaction_date: string;
  }) => Promise<void>;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // Initial state
  transactions: [],
  loading: false,
  error: null,
  selectedDate: null,

  // Actions
  setTransactions: (transactions) => set({ transactions }),

  addTransaction: (transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions],
    })),

  updateTransaction: (id, updates) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  deleteTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  setSelectedDate: (selectedDate) => set({ selectedDate }),

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/transactions");
      if (!response.ok) {
        throw new Error("거래 내역을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      set({ transactions: data.transactions || [], loading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        loading: false,
      });
    }
  },

  createTransaction: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "거래를 생성하는데 실패했습니다.");
      }

      const newTransaction = await response.json();
      set((state) => ({
        transactions: [newTransaction, ...state.transactions],
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        loading: false,
      });
      throw error;
    }
  },
}));

