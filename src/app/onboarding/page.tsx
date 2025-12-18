"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import Link from "next/link";

/**
 * 회원가입 후 추가 정보 입력 페이지 컴포넌트입니다.
 * 
 * 사용자가 회원가입 후 이름, 나이, 거주지 등의 추가 정보를 입력합니다.
 * 정보 입력 후 대시보드로 이동합니다.
 * 
 * @returns {JSX.Element} 온보딩 폼 UI
 */
export default function OnboardingPage() {
  const router = useRouter();
  // 클라이언트에서만 실행되도록 lazy initialization
  const supabase = useMemo(() => {
    if (typeof window === 'undefined') {
      // 서버 사이드에서는 null 반환 (실제로는 사용되지 않음)
      return null;
    }
    return createClient();
  }, []) as ReturnType<typeof createClient> | null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
  });

  /** 로그인 상태 확인 및 기존 프로필 확인 */
  useEffect(() => {
    if (!supabase) return;
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // 기존 프로필 확인
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        // 프로필이 이미 있으면 대시보드로 이동
        router.push("/dashboard");
        return;
      }

      setChecking(false);
    };

    checkAuth();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase
        .from("profiles")
        .upsert({
          id: session.user.id,
          name: formData.name,
          age: formData.age ? parseInt(formData.age) : null,
          location: formData.location || null,
        });

      if (insertError) {
        throw insertError;
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "정보 저장 중 오류가 발생했습니다.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
        <div className="text-center">
          <p className="text-slate-300">확인 중...</p>
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
          <h1 className="text-2xl font-semibold text-white">추가 정보 입력</h1>
          <p className="text-sm text-slate-300">
            서비스를 이용하기 위해 몇 가지 정보를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              이름 <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label
              htmlFor="age"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              나이
            </label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="30"
            />
          </div>

          <div>
            <label
              htmlFor="location"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              거주지
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-3 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="서울시 강남구"
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
            {loading ? "저장 중..." : "저장하고 시작하기"}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          나중에 입력하시겠어요?{" "}
          <Link href="/dashboard" className="text-purple-200 hover:text-purple-100">
            건너뛰기
          </Link>
        </p>
      </div>
    </div>
  );
}

