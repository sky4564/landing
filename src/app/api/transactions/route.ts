import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * GET /api/transactions
 * 거래 내역 조회
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 쿼리 파라미터에서 필터링 옵션 가져오기
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'income' 또는 'expense'

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    // 타입 필터링
    if (type && (type === "income" || type === "expense")) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;

    if (error) {
      console.error("거래 내역 조회 오류:", error);
      return NextResponse.json(
        { message: "거래 내역을 불러오는데 실패했습니다.", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      transactions: data || [],
    });
  } catch (err) {
    console.error("거래 내역 조회 예외:", err);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: err instanceof Error ? err.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/transactions
 * 거래 추가
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { message: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, amount, category, description, transactionDate } = body;

    // 유효성 검사
    if (!type || (type !== "income" && type !== "expense")) {
      return NextResponse.json(
        { message: "거래 유형은 'income' 또는 'expense'여야 합니다." },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { message: "금액은 0보다 큰 숫자여야 합니다." },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string" || category.trim() === "") {
      return NextResponse.json(
        { message: "카테고리는 필수입니다." },
        { status: 400 }
      );
    }

    // 거래 추가
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        type,
        amount,
        category: category.trim(),
        description: description?.trim() || null,
        transaction_date: transactionDate || new Date().toISOString().split("T")[0],
      })
      .select()
      .single();

    if (error) {
      console.error("거래 추가 오류:", error);
      return NextResponse.json(
        { message: "거래 추가에 실패했습니다.", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "거래가 추가되었습니다.",
        transaction: data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("거래 추가 예외:", err);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: err instanceof Error ? err.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

