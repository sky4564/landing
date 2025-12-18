import { createBrowserClient } from "@supabase/ssr";

/**
 * 브라우저 환경에서 사용할 Supabase 클라이언트를 생성합니다.
 * 
 * 클라이언트 컴포넌트나 브라우저에서 실행되는 코드에서 사용합니다.
 * 환경 변수에서 Supabase URL과 Anon Key를 읽어 클라이언트를 초기화합니다.
 * 
 * @returns {ReturnType<typeof createBrowserClient>} Supabase 브라우저 클라이언트 인스턴스
 * @throws {Error} 환경 변수가 설정되지 않은 경우 에러를 던집니다.
 * 
 * @example
 * ```tsx
 * 'use client';
 * import { createClient } from '@/lib/supabaseClient';
 * 
 * const supabase = createClient();
 * const { data } = await supabase.from('users').select();
 * ```
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL/Anon key가 설정되지 않았습니다.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
