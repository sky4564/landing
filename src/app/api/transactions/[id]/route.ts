import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * 특정 거래 내역을 조회, 수정, 삭제하는 API 엔드포인트입니다.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = user.id;

    const { data: transaction, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "거래 내역을 찾을 수 없습니다.", details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(transaction);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const userId = user.id;

    // 먼저 거래 내역 조회 (budgets 업데이트를 위해)
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "거래 내역을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 거래 내역 삭제
    const { error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (deleteError) {
      return NextResponse.json(
        { error: "거래 내역을 삭제하는데 실패했습니다.", details: deleteError.message },
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
        transaction.type === "income"
          ? Math.max(0, Number(budget.income) - Number(transaction.amount))
          : Number(budget.income);
      const newExpense =
        transaction.type === "expense"
          ? Math.max(0, Number(budget.expense) - Number(transaction.amount))
          : Number(budget.expense);
      const newBalance =
        transaction.type === "income"
          ? Number(budget.balance) - Number(transaction.amount)
          : Number(budget.balance) + Number(transaction.amount);
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

    return NextResponse.json({ success: true });
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

