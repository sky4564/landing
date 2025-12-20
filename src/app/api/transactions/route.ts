import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * 거래 내역을 조회하는 API 엔드포인트입니다.
 * 
 * GET: 사용자의 모든 거래 내역을 조회합니다.
 * POST: 새로운 거래 내역을 생성합니다.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다.", details: authError?.message },
        { status: 401 }
      );
    }

    const userId = user.id;

    // transactions 테이블에서 사용자의 거래 내역 조회
    const { data: transactions, error: transactionError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (transactionError) {
      console.error("거래 내역 조회 오류:", transactionError);
      return NextResponse.json(
        {
          error: "거래 내역을 불러오는데 실패했습니다.",
          details: transactionError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: transactions || [],
    });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다.", details: authError?.message },
        { status: 401 }
      );
    }

    const userId = user.id;
    const body = await request.json();

    const { type, amount, description, category, transaction_date } = body;

    // 유효성 검사
    if (!type || !["income", "expense"].includes(type)) {
      return NextResponse.json(
        { error: "거래 유형은 'income' 또는 'expense'여야 합니다." },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "금액은 0보다 큰 값이어야 합니다." },
        { status: 400 }
      );
    }

    if (!transaction_date) {
      return NextResponse.json(
        { error: "거래 날짜가 필요합니다." },
        { status: 400 }
      );
    }

    // 거래 내역 생성
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        type,
        amount,
        description: description || null,
        category: category || null,
        transaction_date,
      })
      .select()
      .single();

    if (insertError) {
      console.error("거래 내역 생성 오류:", insertError);
      return NextResponse.json(
        {
          error: "거래 내역을 생성하는데 실패했습니다.",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    // budgets 테이블 업데이트
    const { data: budget } = await supabase
      .from("budgets")
      .select("*")
      .eq("id", userId)
      .single();

    if (budget) {
      const newIncome =
        type === "income"
          ? Number(budget.income) + Number(amount)
          : Number(budget.income);
      const newExpense =
        type === "expense"
          ? Number(budget.expense) + Number(amount)
          : Number(budget.expense);
      const newBalance =
        type === "income"
          ? Number(budget.balance) + Number(amount)
          : Number(budget.balance) - Number(amount);
      const newExpectedRemain = newIncome - newExpense - Number(budget.shared_expense);

      await supabase
        .from("budgets")
        .update({
          income: newIncome,
          expense: newExpense,
          balance: newBalance,
          expected_remain: newExpectedRemain,
        })
        .eq("id", userId);
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

