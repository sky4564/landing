import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * 사용자 로그아웃 API 엔드포인트입니다.
 * 
 * 현재 세션을 종료하고 쿠키를 삭제합니다.
 * 로그아웃 성공 시 홈 페이지로 리다이렉트됩니다.
 * 
 * @returns {Promise<NextResponse>} 로그아웃 성공 응답 또는 에러 응답
 * 
 * @example
 * ```typescript
 * // POST /api/auth/logout
 * // 성공 시: { success: true }
 * // 실패 시: { error: "로그아웃에 실패했습니다." }
 * ```
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { error: "로그아웃에 실패했습니다." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}

