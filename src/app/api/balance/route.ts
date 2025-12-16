import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

// TODO: 실제 오픈뱅킹/은행 API 연동 시
// 1) 이 라우트 안에서 액세스 토큰을 사용해 잔액/거래 내역을 조회하고
// 2) 필요한 형태로 가공해서 반환합니다.
//
// - 클라이언트 키/시크릿, 리다이렉트 URL 등은 모두 .env.local 에 보관
// - 이 파일에서는 process.env 로만 접근 (절대 프론트로 직접 노출 X)

export async function GET() {
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error || !session) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 },
    );
  }

  const userId = session.user.id;

  // 현재는 환경변수 기반 MOCK. 실제로는 userId에 매핑된 은행 연결 정보를 조회 후
  // 오픈뱅킹/은행 API를 호출해 잔액을 가져옵니다.
  const balance = Number(process.env.MOCK_BALANCE ?? 1_800_000);
  const income = Number(process.env.MOCK_INCOME ?? 3_200_000);
  const expense = Number(process.env.MOCK_EXPENSE ?? 1_800_000);
  const sharedExpense = Number(process.env.MOCK_SHARED_EXPENSE ?? 720_000);
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


