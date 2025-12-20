"use client";

import { useEffect, useState } from "react";

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

type TransactionListProps = {
  refreshTrigger?: number;
  selectedDate?: Date | null;
  onClearDateSelection?: () => void;
  onRefresh?: () => void;
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * 거래 내역 목록 컴포넌트
 * 수입/지출 거래 내역을 표시하고 관리할 수 있습니다.
 */
export function TransactionList({
  refreshTrigger,
  selectedDate,
  onClearDateSelection,
  onRefresh,
}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }
      const res = await fetch(`/api/transactions?${params.toString()}`);
      if (!res.ok) {
        throw new Error("거래 내역을 불러오지 못했습니다.");
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 이 거래를 삭제하시겠습니까?")) {
      return;
    }

    try {
      console.log("삭제 시도 - Transaction ID:", id);
      const res = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("삭제 실패 응답:", data);
        throw new Error(data.message || data.error || "거래 삭제에 실패했습니다.");
      }

      console.log("삭제 성공:", data);

      // 목록 새로고침
      fetchTransactions();
      // 캘린더도 새로고침
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error("삭제 오류:", err);
      alert(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  // 날짜 필터링 함수
  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const filteredTransactions = transactions
    .filter((transaction) => {
      // 선택된 날짜가 있으면 해당 날짜만 필터링
      if (selectedDate) {
        const selectedDateKey = formatDateKey(selectedDate);
        return transaction.transactionDate === selectedDateKey;
      }
      return true;
    })
    .sort((a, b) => {
      return new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime();
    });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
            거래 내역
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {selectedDate
              ? `${formatDate(formatDateKey(selectedDate))} 거래`
              : "수입/지출 관리"}
          </h2>
          {selectedDate && onClearDateSelection && (
            <button
              onClick={onClearDateSelection}
              className="mt-1 text-xs text-purple-300 hover:text-purple-200"
            >
              전체 보기
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === "all"
              ? "bg-purple-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === "income"
              ? "bg-emerald-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
          >
            수입
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === "expense"
              ? "bg-red-500 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
          >
            지출
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      {filter === "all" && transactions.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-900/50 p-3">
          <div>
            <p className="text-xs text-slate-400">총 수입</p>
            <p className="mt-1 text-sm font-semibold text-emerald-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">총 지출</p>
            <p className="mt-1 text-sm font-semibold text-red-400">
              {formatCurrency(totalExpense)}
            </p>
          </div>
        </div>
      )}

      {/* 로딩 상태 */}
      {loading && (
        <div className="py-8 text-center text-slate-400">불러오는 중...</div>
      )}

      {/* 에러 상태 */}
      {!loading && error && (
        <div className="py-8 text-center text-red-400">{error}</div>
      )}

      {/* 거래 목록 */}
      {!loading && !error && filteredTransactions.length === 0 && (
        <div className="py-8 text-center text-slate-400">
          거래 내역이 없습니다.
        </div>
      )}

      {!loading && !error && filteredTransactions.length > 0 && (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-slate-900/30 p-3 transition hover:bg-slate-900/50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${transaction.type === "income"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-red-500/20 text-red-300"
                      }`}
                  >
                    {transaction.type === "income" ? "수입" : "지출"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {transaction.category}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(Number(transaction.amount))}
                </p>
                {transaction.description && (
                  <p className="mt-1 text-xs text-slate-400">
                    {transaction.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(transaction.transactionDate)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(transaction.id)}
                className="ml-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/30"
              >
                삭제
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

