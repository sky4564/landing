"use client";

import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";

/**
 * 수입/지출 기능을 통합한 섹션 컴포넌트
 */
export function TransactionsSection() {
  return (
    <div className="space-y-6">
      <TransactionForm />
      <TransactionList />
    </div>
  );
}

