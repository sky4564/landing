import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !session.user.id) {
    redirect("/login");
  }

  // 샘플: userId 별 mock 값을 DB에서 찾거나 기본값 사용
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { bankConnections: true },
  });

  const balance =
    Number(process.env.MOCK_BALANCE ?? 1_800_000) +
    (user?.bankConnections.length ?? 0) * 0; // 자리표시자

  const income = Number(process.env.MOCK_INCOME ?? 3_200_000);
  const expense = Number(process.env.MOCK_EXPENSE ?? 1_800_000);
  const sharedExpense = Number(process.env.MOCK_SHARED_EXPENSE ?? 720_000);
  const expectedRemain = Number(
    process.env.MOCK_EXPECTED_REMAIN ?? 1_400_000,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
            대시보드
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {session.user.email} 님의 가계 현황
          </h1>
          <p className="text-slate-300">
            연결된 계좌의 잔액과 최근 지출을 한 곳에서 확인하세요. (지금은
            샘플 데이터로 표시됩니다)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>총 예산</span>
              <span className="text-xs text-emerald-300">로그인 세션 기준</span>
            </div>
            <div className="mt-2 text-3xl font-semibold text-white">
              {formatCurrency(balance)}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-[80%] rounded-full bg-gradient-to-r from-purple-500 to-cyan-400" />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              은행 API 연동 시 userId에 매핑된 토큰으로 잔액을 불러옵니다.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <p className="text-slate-400">이번 달 수입</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(income)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">지출</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(expense)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">공동지출</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(sharedExpense)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">예상 남음</p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(expectedRemain)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-100">
              다음 단계 · 은행 연결
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>· 오픈뱅킹 인증 후 Access Token 저장 (BankConnection)</li>
              <li>· 토큰 만료 시 Refresh 로직 추가</li>
              <li>· `/api/balance`에서 실제 잔액 조회로 교체</li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              실계좌 연동 전까지는 환경변수 기반의 모의 잔액이 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { BalanceCard } from "@/components/BalanceCard";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const userEmail = session.user.email ?? "사용자";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
            대시보드
          </p>
          <h1 className="text-3xl font-semibold text-white">
            {userEmail} 님의 가계 현황
          </h1>
          <p className="text-slate-300">
            연결된 계좌의 잔액과 최근 지출을 한 곳에서 확인하세요. (지금은
            샘플 데이터로 표시됩니다)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <BalanceCard />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
            <p className="text-sm font-semibold text-cyan-100">
              다음 단계 · 은행 연결
            </p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              <li>· 오픈뱅킹 인증 후 Access Token 저장</li>
              <li>· 토큰 만료 시 Refresh 로직 추가</li>
              <li>· `/api/balance`에서 실제 잔액 조회로 교체</li>
            </ul>
            <p className="mt-3 text-xs text-slate-400">
              실계좌 연동 전까지는 환경변수 기반의 모의 잔액이 표시됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


