"use client";

import { useEffect, useState } from "react";

type BalanceResponse = {
  balance: number;
  income: number;
  expense: number;
  sharedExpense: number;
  expectedRemain: number;
  currency: string;
  updatedAt: string;
};

function formatCurrency(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export function BalanceCard() {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/balance");
        if (!res.ok) {
          throw new Error("잔액 정보를 불러오지 못했습니다.");
        }
        const json = (await res.json()) as BalanceResponse;
        setData(json);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const balance = data?.balance ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>총 예산</span>
        {data && (
          <span className="text-xs text-emerald-300">
            {new Date(data.updatedAt).toLocaleString("ko-KR", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            기준
          </span>
        )}
      </div>

      <div className="mt-2 text-3xl font-semibold text-white">
        {loading && <span className="text-slate-500">불러오는 중...</span>}
        {!loading && error && (
          <span className="text-sm text-rose-300">{error}</span>
        )}
        {!loading && !error && <span>{formatCurrency(balance)}</span>}
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
      </div>
      <p className="mt-2 text-xs text-slate-400">
        실제 계좌/오픈뱅킹 잔액을 기반으로 자동으로 업데이트됩니다.
      </p>

      {data && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div>
            <p className="text-slate-400">이번 달 수입</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(data.income)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">지출</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(data.expense)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">공동지출</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(data.sharedExpense)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">예상 남음</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {formatCurrency(data.expectedRemain)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


