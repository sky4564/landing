"use client";

import { useEffect, useRef } from "react";
import { useTransactionStore } from "@/store/transactionStore";

function formatCurrency(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TransactionList() {
  const {
    transactions,
    loading,
    error,
    fetchTransactions,
    deleteTransaction,
  } = useTransactionStore();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // 이미 fetch했으면 다시 호출하지 않음 (React Strict Mode 대응)
    if (hasFetchedRef.current) {
      return;
    }
    
    hasFetchedRef.current = true;
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 거래를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("거래를 삭제하는데 실패했습니다.");
      }

      deleteTransaction(id);
      // 잔액 정보도 다시 불러오기 위해 페이지 새로고침 (또는 balance API 호출)
      fetchTransactions();
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <h2 className="mb-4 text-xl font-semibold text-white">거래 내역</h2>
        <div className="text-center text-slate-400">불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <h2 className="mb-4 text-xl font-semibold text-white">거래 내역</h2>
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
          {error}
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <h2 className="mb-4 text-xl font-semibold text-white">거래 내역</h2>
        <div className="text-center text-slate-400">
          아직 등록된 거래가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">거래 내역</h2>
        <button
          onClick={fetchTransactions}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-white/10"
        >
          새로고침
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      transaction.type === "income"
                        ? "bg-emerald-500/20 text-emerald-200"
                        : "bg-red-500/20 text-red-200"
                    }`}
                  >
                    {transaction.type === "income" ? "수입" : "지출"}
                  </span>
                  {transaction.category && (
                    <span className="text-xs text-slate-400">
                      {transaction.category}
                    </span>
                  )}
                </div>
                {transaction.description && (
                  <p className="mt-1 text-sm text-slate-200">
                    {transaction.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-400">
                  {formatDate(transaction.transaction_date)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-lg font-semibold ${
                    transaction.type === "income"
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-300 transition hover:bg-red-500/20"
                  aria-label="삭제"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

