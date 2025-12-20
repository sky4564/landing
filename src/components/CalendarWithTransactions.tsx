"use client";

import { useMemo } from "react";
import { Calendar } from "./Calendar";
import { useTransactionStore } from "@/store/transactionStore";

/**
 * Transactions 데이터와 연동된 Calendar 컴포넌트
 */
export function CalendarWithTransactions() {
  const { transactions, selectedDate, setSelectedDate } = useTransactionStore();

  // 날짜별 수입/지출 데이터 생성
  const dateData = useMemo(() => {
    const data: Record<string, { income?: number; expense?: number }> = {};

    transactions.forEach((transaction) => {
      const dateKey = transaction.transaction_date;
      if (!data[dateKey]) {
        data[dateKey] = {};
      }

      if (transaction.type === "income") {
        data[dateKey].income =
          (data[dateKey].income || 0) + Number(transaction.amount);
      } else {
        data[dateKey].expense =
          (data[dateKey].expense || 0) + Number(transaction.amount);
      }
    });

    return data;
  }, [transactions]);

  return (
    <Calendar
      selectedDate={selectedDate || undefined}
      onDateSelect={(date) => setSelectedDate(date)}
      dateData={dateData}
    />
  );
}

