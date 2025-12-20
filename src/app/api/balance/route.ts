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
 * transactions 테이블에서 실제 거래 내역을 집계하여 수입, 지출, 잔액을 계산합니다.
 * 
 * @returns {Promise<NextResponse>} JSON 형태의 재무 정보
 * @returns {Promise<NextResponse>} 인증 실패 시 401 에러 응답
 * 
 * @example
 * ```typescript
 * // 응답 형식
 * {
 *   userId: string,
 *   balance: number,        // 현재 잔액 (수입 - 지출)
 *   income: number,         // 총 수입
 *   expense: number,        // 총 지출
 *   sharedExpense: number, // 공동 지출 (현재는 0, 향후 확장 가능)
 *   expectedRemain: number, // 예상 남음 (수입 - 지출)
 *   currency: "KRW",
 *   updatedAt: string       // ISO 8601 형식
 * }
 * ```
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("인증 오류:", authError);
      return NextResponse.json(
        { error: "인증이 필요합니다.", details: authError?.message },
        { status: 401 },
      );
    }

    /** 현재 로그인한 사용자의 고유 ID */
    const userId = user.id;

    // transactions 테이블에서 사용자의 모든 거래 내역 조회
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select("type, amount")
      .eq("user_id", userId);

    if (transactionsError) {
      console.error("거래 내역 조회 오류:", {
        code: transactionsError.code,
        message: transactionsError.message,
        details: transactionsError.details,
        hint: transactionsError.hint,
      });

      let errorMessage = "거래 내역을 불러오는데 실패했습니다.";
      if (transactionsError.code === "42P01") {
        errorMessage = "transactions 테이블이 존재하지 않습니다. Supabase Dashboard에서 테이블을 생성해주세요.";
      } else if (transactionsError.code === "42501") {
        errorMessage = "거래 내역에 접근할 수 있는 권한이 없습니다. RLS 정책을 확인해주세요.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: transactionsError.message,
          code: transactionsError.code,
        },
        { status: 500 },
      );
    }

    // 거래 내역 집계
    let totalIncome = 0;
    let totalExpense = 0;

    if (transactions && transactions.length > 0) {
      transactions.forEach((transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === "income") {
          totalIncome += amount;
        } else if (transaction.type === "expense") {
          totalExpense += amount;
        }
      });
    }

    // 잔액 계산 (수입 - 지출)
    const balance = totalIncome - totalExpense;
    const sharedExpense = 0; // 향후 공동 지출 기능 추가 시 사용
    const expectedRemain = balance - sharedExpense;

    // 가장 최근 거래 날짜 찾기
    const { data: latestTransaction } = await supabase
      .from("transactions")
      .select("created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      userId,
      balance,
      income: totalIncome,
      expense: totalExpense,
      sharedExpense,
      expectedRemain,
      currency: "KRW",
      updatedAt: latestTransaction?.created_at || new Date().toISOString(),
    });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}


