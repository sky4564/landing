"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "가입 실패");
        }
        setMessage("가입이 완료되었습니다. 로그인해 주세요.");
        setMode("login");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setMessage(result.error);
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-6 py-12 text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <div className="flex justify-center gap-3 text-sm font-semibold text-white">
          <button
            className={`rounded-full px-4 py-2 transition ${
              mode === "login"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white"
                : "bg-white/5 text-slate-200"
            }`}
            onClick={() => setMode("login")}
            type="button"
          >
            로그인
          </button>
          <button
            className={`rounded-full px-4 py-2 transition ${
              mode === "signup"
                ? "bg-gradient-to-r from-purple-500 to-cyan-400 text-white"
                : "bg-white/5 text-slate-200"
            }`}
            onClick={() => setMode("signup")}
            type="button"
          >
            회원가입
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-1">
              <label className="text-sm text-slate-200">이름 (선택)</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-sm text-slate-200">이메일</label>
            <input
              required
              type="email"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-slate-200">비밀번호</label>
            <input
              required
              type="password"
              className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
          {message && (
            <p className="text-sm text-amber-200">
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

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


