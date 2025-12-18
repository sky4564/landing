import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseServer";

/**
 * 사용자 프로필 정보를 조회하는 API 엔드포인트입니다.
 * 
 * @returns {Promise<NextResponse>} 사용자 프로필 정보 또는 에러 응답
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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // PGRST116은 "no rows returned" 에러 (프로필이 없는 경우)
    if (profileError) {
      if (profileError.code === "PGRST116") {
        // 프로필이 없으면 빈 프로필 자동 생성
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: null,
            age: null,
            location: null,
          })
          .select()
          .single();

        if (createError) {
          console.error("프로필 자동 생성 오류:", {
            code: createError.code,
            message: createError.message,
            details: createError.details,
            hint: createError.hint,
          });

          // 생성 실패해도 null 반환 (에러 아님)
          return NextResponse.json({
            profile: null,
            user: {
              id: user.id,
              email: user.email,
            },
          });
        }

        return NextResponse.json({
          profile: newProfile,
          user: {
            id: user.id,
            email: user.email,
          },
        });
      }

      // 다른 에러인 경우 (테이블이 없거나, RLS 정책 문제 등)
      console.error("프로필 조회 오류:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      let errorMessage = "프로필을 불러오는데 실패했습니다.";
      if (profileError.code === "42P01") {
        errorMessage = "profiles 테이블이 존재하지 않습니다. Supabase Dashboard에서 테이블을 생성해주세요.";
      } else if (profileError.code === "42501") {
        errorMessage = "프로필에 접근할 수 있는 권한이 없습니다. RLS 정책을 확인해주세요.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: profileError.message,
          code: profileError.code,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      profile: profile || null,
      user: {
        id: user.id,
        email: user.email,
      },
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

/**
 * 사용자 프로필 정보를 업데이트하는 API 엔드포인트입니다.
 * 
 * @param {Request} request - 업데이트할 프로필 정보를 담은 요청
 * @returns {Promise<NextResponse>} 업데이트 결과 또는 에러 응답
 */
export async function PUT(request: Request) {
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

    const body = await request.json();
    const { name, age, location } = body;

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        name: name || null,
        age: age ? parseInt(age) : null,
        location: location || null,
      })
      .select()
      .single();

    if (updateError) {
      console.error("프로필 업데이트 오류:", {
        code: updateError.code,
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
      });

      let errorMessage = "프로필 업데이트에 실패했습니다.";
      if (updateError.code === "42P01") {
        errorMessage = "profiles 테이블이 존재하지 않습니다. Supabase Dashboard에서 테이블을 생성해주세요.";
      } else if (updateError.code === "42501") {
        errorMessage = "프로필을 수정할 수 있는 권한이 없습니다. RLS 정책을 확인해주세요.";
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: updateError.message,
          code: updateError.code,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ profile });
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

