"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";
import { useMemo } from "react";

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);

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
              sign_in: { email_label: "이메일" },
              sign_up: { email_label: "이메일" },
            },
          }}
          redirectTo="/dashboard"
        />
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


