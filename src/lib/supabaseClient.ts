import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL/Anon key가 설정되지 않았습니다.");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}


