"use client";

import { useState } from "react";

type TransactionType = "income" | "expense";

const INCOME_CATEGORIES = [
  "급여",
  "용돈",
  "부수입",
  "투자수익",
  "기타수입",
];

const EXPENSE_CATEGORIES = [
  "식비",
  "교통비",
  "쇼핑",
  "의료비",
  "통신비",
  "주거비",
  "교육비",
  "문화생활",
  "기타지출",
];

type TransactionFormProps = {
  onSuccess?: () => void;
};

/**
 * 거래 입력 폼 컴포넌트
 * 수입/지출 거래를 입력할 수 있는 폼입니다.
 */
export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          category: category || (type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]),
          description,
          transactionDate,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "거래 추가에 실패했습니다.");
      }

      setMessage({
        type: "success",
        text: `${type === "income" ? "수입" : "지출"}이 추가되었습니다.`,
      });

      // 폼 초기화
      setAmount("");
      setDescription("");
      setCategory("");
      setTransactionDate(new Date().toISOString().split("T")[0]);

      // 성공 콜백 실행
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 500);
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "오류가 발생했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
          거래 입력
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">수입/지출 추가</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 거래 유형 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-200">
            거래 유형
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("");
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                type === "income"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              수입
            </button>
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("");
              }}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                type === "expense"
                  ? "bg-red-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              지출
            </button>
          </div>
        </div>

        {/* 금액 입력 */}
        <div>
          <label
            htmlFor="amount"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            금액
          </label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              required
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 pl-12 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="0"
              disabled={loading}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              ₩
            </span>
          </div>
        </div>

        {/* 카테고리 선택 */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            카테고리
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            disabled={loading}
          >
            <option value="">선택하세요</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 날짜 선택 */}
        <div>
          <label
            htmlFor="transactionDate"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            거래 날짜
          </label>
          <input
            id="transactionDate"
            type="date"
            required
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            disabled={loading}
          />
        </div>

        {/* 설명 입력 */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-200"
          >
            설명 (선택사항)
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            placeholder="거래에 대한 메모를 입력하세요..."
            disabled={loading}
          />
        </div>

        {/* 메시지 표시 */}
        {message && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                : "bg-red-500/10 border-red-500/20 text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "추가 중..." : "거래 추가"}
        </button>
      </form>
    </div>
  );
}

