"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

/**
 * 비밀번호 재설정 폼 컴포넌트
 */
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // 세션 확인
    const checkSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError("유효하지 않은 링크입니다. 비밀번호 재설정 링크를 다시 요청해주세요.");
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message || "비밀번호 재설정에 실패했습니다.");
      } else {
        setSuccess(true);
        // 2초 후 로그인 페이지로 이동
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur text-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
              LifeTools 가계부
            </p>
            <h1 className="text-2xl font-semibold text-white">비밀번호 재설정 완료</h1>
            <p className="text-sm text-emerald-200">
              비밀번호가 성공적으로 변경되었습니다.
            </p>
            <p className="text-xs text-slate-400">
              잠시 후 로그인 페이지로 이동합니다...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-purple-200">
            LifeTools 가계부
          </p>
          <h1 className="text-2xl font-semibold text-white">새 비밀번호 설정</h1>
          <p className="text-sm text-slate-300">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              새 비밀번호
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="최소 6자 이상"
              disabled={loading}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="비밀번호를 다시 입력하세요"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "처리 중..." : "비밀번호 변경"}
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

/**
 * 비밀번호 재설정 페이지 컴포넌트입니다.
 * 
 * 이메일로 받은 재설정 링크를 통해 접근하며, 새 비밀번호를 설정할 수 있습니다.
 * 
 * @returns {JSX.Element} 비밀번호 재설정 UI
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur text-center">
          <p className="text-slate-300">로딩 중...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

