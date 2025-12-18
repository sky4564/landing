import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabaseServer";
import { BalanceCard } from "@/components/BalanceCard";
import { LogoutButton } from "@/components/LogoutButton";
import { UserProfile } from "@/components/UserProfile";

/**
 * 사용자 대시보드 페이지 컴포넌트입니다.
 * 
 * 인증된 사용자만 접근할 수 있으며, 로그인하지 않은 사용자는
 * 자동으로 로그인 페이지로 리다이렉트됩니다.
 * 
 * 현재 사용자의 이메일을 표시하고, 계좌 잔액 및 재무 정보를
 * BalanceCard 컴포넌트를 통해 표시합니다.
 * 
 * @returns {Promise<JSX.Element>} 대시보드 페이지 UI
 * 
 * @example
 * ```tsx
 * // 인증된 사용자: 대시보드 표시
 * // 미인증 사용자: /login으로 리다이렉트
 * ```
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  /** 현재 로그인한 사용자의 이메일 주소 (없을 경우 "사용자"로 표시) */
  const userEmail = user.email ?? "사용자";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
              대시보드
            </p>
            <h1 className="text-3xl font-semibold text-white">
              {userEmail} 님의 가계 현황
            </h1>
            <p className="text-slate-300">
              연결된 계좌의 잔액과 최근 지출을 한 곳에서 확인하세요.
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <BalanceCard />
          <div className="space-y-6">
            <UserProfile />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
              <p className="text-sm font-semibold text-cyan-100">
                다음 단계 · 은행 연결
              </p>
              <ul className="mt-3 space-y-2 text-sm text-slate-200">
                <li>· 오픈뱅킹 인증 후 Access Token 저장</li>
                <li>· 토큰 만료 시 Refresh 로직 추가</li>
                <li>· 오픈뱅킹 API 연동하여 budgets 테이블 자동 업데이트</li>
              </ul>
              <p className="mt-3 text-xs text-slate-400">
                현재는 budgets 테이블의 데이터를 표시합니다. 오픈뱅킹 연동 후 자동으로 업데이트됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


