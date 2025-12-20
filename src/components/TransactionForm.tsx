"use client";

import { useState } from "react";
import { useTransactionStore, TransactionType } from "@/store/transactionStore";

export function TransactionForm() {
  const { createTransaction, loading, error } = useTransactionStore();
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      alert("금액을 올바르게 입력해주세요.");
      return;
    }

    try {
      await createTransaction({
        type,
        amount: Number(amount),
        description: description || undefined,
        category: category || undefined,
        transaction_date: transactionDate,
      });

      // 폼 초기화
      setAmount("");
      setDescription("");
      setCategory("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      // 에러는 store에서 처리됨
      console.error("거래 생성 실패:", err);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      <h2 className="mb-4 text-xl font-semibold text-white">거래 추가</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-500/20 border border-red-500/50 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 거래 유형 선택 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            거래 유형
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("income")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${type === "income"
                  ? "border-emerald-500 bg-emerald-500/20 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                }`}
            >
              수입
            </button>
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition ${type === "expense"
                  ? "border-red-500 bg-red-500/20 text-red-200"
                  : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
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
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            금액 (원)
          </label>
          <input
            id="amount"
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* 거래 날짜 */}
        <div>
          <label
            htmlFor="transactionDate"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            거래 날짜
          </label>
          <input
            id="transactionDate"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            required
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* 설명 */}
        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            설명 (선택)
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="거래 설명을 입력하세요"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label
            htmlFor="category"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            카테고리 (선택)
          </label>
          <input
            id="category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="예: 식비, 교통비, 급여 등"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 px-4 py-3 font-semibold text-white transition hover:from-purple-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "처리 중..." : "거래 추가"}
        </button>
      </form>
    </div>
  );
}

