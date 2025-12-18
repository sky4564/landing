"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import { useState } from "react";

/**
 * 로그아웃 버튼 컴포넌트입니다.
 * 
 * 클릭 시 Supabase 세션을 종료하고 홈 페이지로 리다이렉트합니다.
 * 로그아웃 중에는 버튼이 비활성화되고 로딩 상태를 표시합니다.
 * 
 * @returns {JSX.Element} 로그아웃 버튼 UI
 * 
 * @example
 * ```tsx
 * <LogoutButton />
 * ```
 */
export function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("로그아웃 오류:", error);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "로그아웃 중..." : "로그아웃"}
    </button>
  );
}

