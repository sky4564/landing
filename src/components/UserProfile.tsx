"use client";

import { useState, useEffect } from "react";

/**
 * 사용자 프로필 정보 타입
 */
type UserProfile = {
  id: string;
  name: string | null;
  age: number | null;
  location: string | null;
  email: string | null; // 이메일은 관리 목적으로만 사용 (사용자에게 표시하지 않음)
  created_at: string;
  updated_at: string;
};

/**
 * 사용자 프로필 정보를 표시하고 수정할 수 있는 컴포넌트입니다.
 * 
 * 대시보드에서 사용자의 이름, 나이, 거주지 정보를 표시하고,
 * 수정 버튼을 통해 프로필 정보를 업데이트할 수 있습니다.
 * 
 * @returns {JSX.Element} 사용자 프로필 UI
 */
export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** 프로필 정보 불러오기 */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile");
        const data = await res.json();

        if (!res.ok) {
          // API에서 반환한 상세한 에러 메시지 사용
          const errorMessage = data.error || "프로필을 불러오는데 실패했습니다.";
          setError(errorMessage);
          console.error("프로필 로드 오류:", {
            status: res.status,
            error: data.error,
            details: data.details,
            code: data.code,
          });
        } else {
          // 성공 시 에러 초기화
          setError(null);
          if (data.profile) {
            setProfile(data.profile);
            setFormData({
              name: data.profile.name || "",
              age: data.profile.age?.toString() || "",
              location: data.profile.location || "",
            });
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error
          ? err.message
          : "프로필을 불러오는 중 네트워크 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("프로필 로드 오류:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /** 프로필 정보 저장 */
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload: {
        name?: string | null;
        age?: string | null;
        location?: string | null;
      } = {
        name: formData.name || null,
        age: formData.age || null,
        location: formData.location || null,
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        // API에서 반환한 상세한 에러 메시지 사용
        const errorMessage = data.error || "저장에 실패했습니다.";
        console.error("프로필 저장 오류:", {
          status: res.status,
          error: data.error,
          details: data.details,
          code: data.code,
        });
        throw new Error(errorMessage);
      }

      const data = await res.json();
      setProfile(data.profile);
      setEditing(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
        <p className="text-slate-400">프로필 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-indigo-900/30 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-cyan-100">내 프로필</p>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
          >
            수정
          </button>
        )}
      </div>

      {/* 로드 에러 표시 */}
      {error && !editing && (
        <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
          <p className="font-semibold mb-1">프로필을 불러올 수 없습니다</p>
          <p className="text-xs text-red-300">{error}</p>
          {error.includes("테이블이 존재하지 않습니다") && (
            <p className="text-xs text-red-300 mt-2">
              Supabase Dashboard → SQL Editor에서 테이블을 생성해주세요.
            </p>
          )}
        </div>
      )}

      {editing ? (
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              이름
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              나이
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="나이를 입력하세요"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">
              거주지
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full rounded-lg border border-white/10 bg-slate-900/50 px-4 py-2 text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              placeholder="거주지를 입력하세요"
            />
          </div>


          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition hover:translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "저장 중..." : "저장"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setError(null);
                if (profile) {
                  setFormData({
                    name: profile.name || "",
                    age: profile.age?.toString() || "",
                    location: profile.location || "",
                  });
                }
              }}
              disabled={saving}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-slate-400">이름</p>
            <p className="text-base font-semibold text-white">
              {profile?.name || "미입력"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">나이</p>
            <p className="text-base font-semibold text-white">
              {profile?.age ? `${profile.age}세` : "미입력"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">거주지</p>
            <p className="text-base font-semibold text-white">
              {profile?.location || "미입력"}
            </p>
          </div>
          {!profile && (
            <p className="text-xs text-slate-400">
              프로필 정보가 없습니다. 수정 버튼을 눌러 정보를 입력하세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

