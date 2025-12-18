"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * 로그인 및 회원가입 페이지 컴포넌트입니다.
 * 
 * Supabase Auth UI를 사용하여 이메일 기반 로그인/회원가입을 제공합니다.
 * 이미 로그인된 사용자는 자동으로 대시보드로 리다이렉트됩니다.
 * 
 * @returns {JSX.Element} 로그인/회원가입 UI
 * 
 * @example
 * ```tsx
 * // 로그인 성공 시 /dashboard로 자동 리다이렉트
 * // 이미 로그인된 사용자는 즉시 대시보드로 이동
 * ```
 */
export default function LoginPage() {
  const router = useRouter();
  // 클라이언트에서만 실행되도록 lazy initialization
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 null 반환 (실제로는 사용되지 않음)
      return null;
    }
    return createClient();
  }, []) as ReturnType<typeof createClient> | null;

  /** 이미 로그인된 사용자인지 확인하고 대시보드로 리다이렉트 */
  useEffect(() => {
    if (!supabase) return;
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [supabase, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
            LifeTools 가계부
          </p>
          <h1 className="text-2xl font-semibold text-white">로그인 / 가입</h1>
          <p className="text-sm text-slate-300">
            이메일로 로그인하거나 새 계정을 만드세요.
          </p>
        </div>
        {supabase && (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#8b5cf6",
                    brandAccent: "#22d3ee",
                    inputBackground: "#0f172a",
                    inputText: "#e2e8f0",
                  },
                },
              },
            }}
            providers={[]}
            localization={{
              variables: {
                sign_in: {
                  email_label: "이메일",
                  password_label: "비밀번호",
                  button_label: "로그인",
                  loading_button_label: "로그인 중...",
                  email_input_placeholder: "your@email.com",
                },
                sign_up: {
                  email_label: "이메일",
                  password_label: "비밀번호",
                  button_label: "회원가입",
                  loading_button_label: "가입 중...",
                  email_input_placeholder: "your@email.com",
                },
              },
            }}
            redirectTo="/onboarding"
            showLinks={true}
            view="sign_in"
          />
        )}
        <p className="text-center text-xs text-slate-400">
          돌아가기{" "}
          <Link href="/" className="text-purple-200 hover:text-purple-100">
            홈으로
          </Link>
        </p>
      </div>
    </div>
  );
}


