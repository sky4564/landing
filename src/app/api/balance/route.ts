import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// TODO: 실제 오픈뱅킹/은행 API 연동 시
// 1) 이 라우트 안에서 액세스 토큰을 사용해 잔액/거래 내역을 조회하고
// 2) 필요한 형태로 가공해서 반환합니다.
//
// - 클라이언트 키/시크릿, 리다이렉트 URL 등은 모두 .env.local 에 보관
// - 이 파일에서는 process.env 로만 접근 (절대 프론트로 직접 노출 X)

/**
 * 사용자의 계좌 잔액 및 재무 정보를 조회하는 API 엔드포인트입니다.
 * 
 * 현재는 환경 변수 기반의 모의(Mock) 데이터를 반환합니다.
 * 실제 서비스에서는 Supabase에 저장된 사용자의 은행 연결 정보를 조회한 후,
 * 오픈뱅킹 API를 호출하여 실제 잔액을 가져옵니다.
 * 
 * @returns {Promise<NextResponse>} JSON 형태의 재무 정보
 * @returns {Promise<NextResponse>} 인증 실패 시 401 에러 응답
 * 
 * @example
 * ```typescript
 * // 응답 형식
 * {
 *   userId: string,
 *   balance: number,        // 현재 잔액
 *   income: number,         // 수입
 *   expense: number,        // 지출
 *   sharedExpense: number, // 공동 지출
 *   expectedRemain: number, // 예상 잔액
 *   currency: "KRW",
 *   updatedAt: string       // ISO 8601 형식
 * }
 * ```
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  /** 현재 로그인한 사용자의 고유 ID */
  const userId = user.id;

  // 현재는 환경변수 기반 MOCK. 실제로는 userId에 매핑된 은행 연결 정보를 조회 후
  // 오픈뱅킹/은행 API를 호출해 잔액을 가져옵니다.

  /** 현재 계좌 잔액 (환경 변수에서 읽어오며, 기본값: 1,800,000원) */
  const balance = Number(process.env.MOCK_BALANCE ?? 1_800_000);

  /** 월 수입 (환경 변수에서 읽어오며, 기본값: 3,200,000원) */
  const income = Number(process.env.MOCK_INCOME ?? 3_200_000);

  /** 월 지출 (환경 변수에서 읽어오며, 기본값: 1,800,000원) */
  const expense = Number(process.env.MOCK_EXPENSE ?? 1_800_000);

  /** 공동 지출 금액 (환경 변수에서 읽어오며, 기본값: 720,000원) */
  const sharedExpense = Number(process.env.MOCK_SHARED_EXPENSE ?? 720_000);

  /** 예상 잔액 (환경 변수에서 읽어오며, 기본값: 1,400,000원) */
  const expectedRemain = Number(
    process.env.MOCK_EXPECTED_REMAIN ?? 1_400_000,
  );

  return NextResponse.json({
    userId,
    balance,
    income,
    expense,
    sharedExpense,
    expectedRemain,
    currency: "KRW",
    updatedAt: new Date().toISOString(),
  });
}


