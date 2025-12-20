import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * DELETE /api/transactions/[id]
 * 거래 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Next.js 15+에서는 params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const transactionId = resolvedParams.id;

    console.log("삭제 요청 - Transaction ID:", transactionId, "User ID:", user.id);

    if (!transactionId) {
      return NextResponse.json(
        { message: "거래 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(transactionId)) {
      return NextResponse.json(
        { message: "유효하지 않은 거래 ID 형식입니다." },
        { status: 400 }
      );
    }

    // 먼저 거래가 존재하고 사용자의 것인지 확인
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id, id, type, amount")
      .eq("id", transactionId)
      .single();

    if (fetchError) {
      console.error("거래 조회 오류:", fetchError);
      return NextResponse.json(
        {
          message: "거래를 찾을 수 없습니다.",
          error: fetchError.message,
          code: fetchError.code,
        },
        { status: 404 }
      );
    }

    if (!transaction) {
      return NextResponse.json(
        { message: "거래를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("조회된 거래:", transaction);

    if (transaction.user_id !== user.id) {
      console.error("권한 오류 - 거래 user_id:", transaction.user_id, "현재 user_id:", user.id);
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 거래 삭제 (RLS 정책에 의해 자동으로 권한 체크됨)
    const { data: deletedData, error: deleteError } = await supabase
      .from("transactions")
      .delete()
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select();

    if (deleteError) {
      console.error("거래 삭제 오류:", deleteError);
      return NextResponse.json(
        {
          message: "거래 삭제에 실패했습니다.",
          error: deleteError.message,
          code: deleteError.code,
          details: deleteError.details,
          hint: deleteError.hint,
        },
        { status: 500 }
      );
    }

    console.log("삭제 성공:", deletedData);

    return NextResponse.json({
      message: "거래가 삭제되었습니다.",
    });
  } catch (err) {
    console.error("거래 삭제 예외:", err);
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
 * PATCH /api/transactions/[id]
 * 거래 수정
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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

    // Next.js 15에서는 params가 Promise일 수 있음
    const resolvedParams = await Promise.resolve(params);
    const transactionId = resolvedParams.id;
    const body = await request.json();

    if (!transactionId) {
      return NextResponse.json(
        { message: "거래 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 먼저 거래가 존재하고 사용자의 것인지 확인
    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select("user_id")
      .eq("id", transactionId)
      .single();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { message: "거래를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (transaction.user_id !== user.id) {
      return NextResponse.json(
        { message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    // 업데이트할 데이터 준비
    const updateData: {
      type?: string;
      amount?: number;
      category?: string;
      description?: string | null;
      transaction_date?: string;
    } = {};

    if (body.type !== undefined) {
      if (body.type !== "income" && body.type !== "expense") {
        return NextResponse.json(
          { message: "거래 유형은 'income' 또는 'expense'여야 합니다." },
          { status: 400 }
        );
      }
      updateData.type = body.type;
    }

    if (body.amount !== undefined) {
      if (typeof body.amount !== "number" || body.amount <= 0) {
        return NextResponse.json(
          { message: "금액은 0보다 큰 숫자여야 합니다." },
          { status: 400 }
        );
      }
      updateData.amount = body.amount;
    }

    if (body.category !== undefined) {
      if (typeof body.category !== "string" || body.category.trim() === "") {
        return NextResponse.json(
          { message: "카테고리는 필수입니다." },
          { status: 400 }
        );
      }
      updateData.category = body.category.trim();
    }

    if (body.description !== undefined) {
      updateData.description = body.description?.trim() || null;
    }

    if (body.transactionDate !== undefined) {
      updateData.transaction_date = body.transactionDate;
    }

    // 거래 수정
    const { data, error: updateError } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("거래 수정 오류:", updateError);
      return NextResponse.json(
        { message: "거래 수정에 실패했습니다.", error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "거래가 수정되었습니다.",
      transaction: data,
    });
  } catch (err) {
    console.error("거래 수정 예외:", err);
    return NextResponse.json(
      {
        message: "서버 오류가 발생했습니다.",
        error: err instanceof Error ? err.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

