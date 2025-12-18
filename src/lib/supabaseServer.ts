import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * 서버 환경에서 사용할 Supabase 클라이언트를 생성합니다.
 * 
 * 서버 컴포넌트, API 라우트, 서버 액션에서 사용합니다.
 * Next.js의 cookies()를 사용하여 인증 세션을 관리하며,
 * 쿠키를 통해 사용자 인증 상태를 유지합니다.
 * 
 * @returns {Promise<ReturnType<typeof createServerClient>>} Supabase 서버 클라이언트 인스턴스
 * @throws {Error} 환경 변수가 설정되지 않은 경우 에러를 던집니다.
 * 
 * @example
 * ```tsx
 * // Server Component
 * export default async function Page() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data: { session } } = await supabase.auth.getSession();
 *   // ...
 * }
 * 
 * // API Route
 * export async function GET() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data } = await supabase.from('users').select();
 *   return NextResponse.json(data);
 * }
 * ```
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL/Anon key가 설정되지 않았습니다.");
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}


