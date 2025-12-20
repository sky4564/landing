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

type BalanceCardProps = {
  refreshTrigger?: number;
};

export function BalanceCard({ refreshTrigger }: BalanceCardProps) {
  const [data, setData] = useState<BalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      setLoading(true);
      setError(null);
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
  }, [refreshTrigger]); // refreshTrigger가 변경될 때마다 잔액 새로고침

  const balance = data?.balance ?? 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>현재 잔액</span>
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
        {!loading && !error && (
          <span className={balance >= 0 ? "text-emerald-400" : "text-red-400"}>
            {formatCurrency(balance)}
          </span>
        )}
      </div>

      {/* 잔액 진행 바 */}
      {data && !loading && !error && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          {data.income > 0 ? (
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 transition-all"
              style={{
                width: `${Math.min(100, Math.max(0, (balance / data.income) * 100))}%`,
              }}
            />
          ) : (
            <div className="h-full w-0 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
          )}
        </div>
      )}
      <p className="mt-2 text-xs text-slate-400">
        거래 내역을 기반으로 자동으로 계산됩니다.
      </p>

      {data && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
          <div>
            <p className="text-slate-400">총 수입</p>
            <p className="mt-1 text-sm font-semibold text-emerald-400">
              {formatCurrency(data.income)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">총 지출</p>
            <p className="mt-1 text-sm font-semibold text-red-400">
              {formatCurrency(data.expense)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">순이익</p>
            <p
              className={`mt-1 text-sm font-semibold ${data.expectedRemain >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
            >
              {formatCurrency(data.expectedRemain)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">거래 건수</p>
            <p className="mt-1 text-sm font-semibold text-white">
              {data.income > 0 || data.expense > 0 ? "확인됨" : "없음"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


