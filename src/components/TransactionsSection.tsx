"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { TransactionList } from "./TransactionList";
import { TransactionForm } from "./TransactionForm";
import { Calendar } from "./Calendar";
import { BalanceCard } from "./BalanceCard";

type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
};

type TransactionsContextType = {
  refreshTrigger: number;
  refresh: () => void;
  transactions: Transaction[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  dateData: Record<string, { income?: number; expense?: number }>;
};

const TransactionsContext = createContext<TransactionsContextType | undefined>(undefined);

/**
 * 거래 관리 컨텍스트 훅
 */
export function useTransactions() {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return context;
}

/**
 * 거래 관리 컨텍스트 프로바이더
 */
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 거래 내역 가져오기
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions");
        if (!res.ok) {
          throw new Error("거래 내역을 불러오지 못했습니다.");
        }
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error("거래 내역 조회 오류:", err);
      }
    };

    fetchTransactions();
  }, [refreshTrigger]);

  // 날짜별 거래 데이터 그룹화
  const dateData = useMemo(() => {
    const grouped: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.transactionDate; // "YYYY-MM-DD" 형식
      if (!grouped[dateKey]) {
        grouped[dateKey] = { income: 0, expense: 0 };
      }

      if (transaction.type === "income") {
        grouped[dateKey].income += Number(transaction.amount);
      } else {
        grouped[dateKey].expense += Number(transaction.amount);
      }
    });

    return grouped;
  }, [transactions]);

  const refresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <TransactionsContext.Provider
      value={{
        refreshTrigger,
        refresh,
        transactions,
        selectedDate,
        setSelectedDate: handleDateSelect,
        dateData,
      }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

/**
 * 거래 목록 컴포넌트 (컨텍스트 사용)
 */
export function TransactionsList() {
  const { refreshTrigger, selectedDate, setSelectedDate, refresh } = useTransactions();
  return (
    <TransactionList
      refreshTrigger={refreshTrigger}
      selectedDate={selectedDate}
      onClearDateSelection={() => setSelectedDate(null)}
      onRefresh={refresh}
    />
  );
}

/**
 * 거래 입력 폼 컴포넌트 (컨텍스트 사용)
 */
export function TransactionsForm() {
  const { refresh } = useTransactions();
  return <TransactionForm onSuccess={refresh} />;
}

/**
 * 캘린더 컴포넌트 (컨텍스트 사용)
 */
export function TransactionsCalendar() {
  const { selectedDate, setSelectedDate, dateData } = useTransactions();

  return (
    <Calendar
      selectedDate={selectedDate || undefined}
      onDateSelect={(date) => {
        // 같은 날짜를 다시 클릭하면 선택 해제
        if (
          selectedDate &&
          selectedDate.getTime() === date.getTime()
        ) {
          setSelectedDate(null);
        } else {
          setSelectedDate(date);
        }
      }}
      dateData={dateData}
    />
  );
}

/**
 * 잔액 카드 컴포넌트 (컨텍스트 사용)
 * 거래 추가/삭제 시 자동으로 새로고침됩니다.
 */
export function TransactionsBalanceCard() {
  const { refreshTrigger } = useTransactions();
  return <BalanceCard refreshTrigger={refreshTrigger} />;
}

