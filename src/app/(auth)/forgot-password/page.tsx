"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";

/**
 * 비밀번호 재설정 요청 페이지 컴포넌트입니다.
 * 
 * 사용자가 이메일을 입력하면 비밀번호 재설정 링크를 이메일로 전송합니다.
 * 
 * @returns {JSX.Element} 비밀번호 재설정 요청 UI
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClient();

      // 비밀번호 재설정 이메일 전송
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "비밀번호 재설정 요청에 실패했습니다.",
        });
      } else {
        setMessage({
          type: "success",
          text: "비밀번호 재설정 링크를 이메일로 전송했습니다. 이메일을 확인해주세요.",
        });
        setEmail("");
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
            LifeTools 가계부
          </p>
          <h1 className="text-2xl font-semibold text-white">비밀번호 찾기</h1>
          <p className="text-sm text-slate-300">
            등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              이메일 주소
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          {message && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${message.type === "success"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
                  : "bg-red-500/10 border-red-500/20 text-red-200"
                }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "전송 중..." : "재설정 링크 전송"}
          </button>
        </form>

        <div className="space-y-2 text-center">
          <Link
            href="/login"
            className="text-sm text-purple-200 hover:text-purple-100 transition"
          >
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

