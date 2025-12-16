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


