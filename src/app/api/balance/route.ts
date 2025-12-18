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
 * Supabase의 budgets 테이블에서 실제 데이터를 조회합니다.
 * 데이터가 없으면 기본값(0)으로 빈 레코드를 자동 생성합니다.
 * 
 * 향후 오픈뱅킹 API 연동 시, 이 엔드포인트에서 은행 연결 정보를 조회한 후
 * 오픈뱅킹 API를 호출하여 실제 잔액을 업데이트할 수 있습니다.
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

    // budgets 테이블에서 사용자 예산 정보 조회
    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", userId)
      .single();

    // PGRST116은 "no rows returned" 에러 (예산 데이터가 없는 경우)
    if (budgetError) {
      if (budgetError.code === "PGRST116") {
        // 예산 데이터가 없으면 기본값으로 빈 레코드 자동 생성
        const { data: newBudget, error: createError } = await supabase
          .from("budgets")
          .insert({
            id: userId,
            balance: 0,
            income: 0,
            expense: 0,
            shared_expense: 0,
            expected_remain: 0,
            currency: "KRW",
          })
          .select()
          .single();

        if (createError) {
          console.error("예산 자동 생성 오류:", {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
          });

          // 생성 실패 시 기본값 반환
          return NextResponse.json({
            userId,
            balance: 0,
            income: 0,
            expense: 0,
            sharedExpense: 0,
            expectedRemain: 0,
            currency: "KRW",
            updatedAt: new Date().toISOString(),
          });
        }

        // 새로 생성된 예산 데이터 반환
        return NextResponse.json({
          userId,
          balance: Number(newBudget.balance),
          income: Number(newBudget.income),
          expense: Number(newBudget.expense),
          sharedExpense: Number(newBudget.shared_expense),
          expectedRemain: Number(newBudget.expected_remain),
          currency: newBudget.currency || "KRW",
          updatedAt: newBudget.updated_at || new Date().toISOString(),
        });
      }

      // 다른 에러인 경우 (테이블이 없거나, RLS 정책 문제 등)
      console.error("예산 조회 오류:", {
        code: budgetError.code,
        message: budgetError.message,
        details: budgetError.details,
        hint: budgetError.hint,
      });

      let errorMessage = "예산 정보를 불러오는데 실패했습니다.";
      if (budgetError.code === "42P01") {
        errorMessage = "budgets 테이블이 존재하지 않습니다. Supabase Dashboard에서 테이블을 생성해주세요.";
      } else if (budgetError.code === "42501") {
        errorMessage = "예산 정보에 접근할 수 있는 권한이 없습니다. RLS 정책을 확인해주세요.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: budgetError.message,
          code: budgetError.code,
        },
        { status: 500 },
      );
    }

    // 조회 성공 시 실제 DB 데이터 반환
    return NextResponse.json({
      userId,
      balance: Number(budget.balance),
      income: Number(budget.income),
      expense: Number(budget.expense),
      sharedExpense: Number(budget.shared_expense),
      expectedRemain: Number(budget.expected_remain),
      currency: budget.currency || "KRW",
      updatedAt: budget.updated_at || new Date().toISOString(),
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


