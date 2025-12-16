## LifeTools Landing (App Router, TS, Tailwind)

이 저장소는 두 가지 인증/DB 접근 방식을 실험하기 위한 브랜치를 포함합니다.

### Branch A: Supabase Auth + Managed DB
- 브랜치: `feature/auth-supabase`
- 의존성: `@supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/auth-helpers-nextjs`
- `.env.local`
  ```
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  # Mock balance fallback
  MOCK_BALANCE=1800000
  MOCK_INCOME=3200000
  MOCK_EXPENSE=1800000
  MOCK_SHARED_EXPENSE=720000
  MOCK_EXPECTED_REMAIN=1400000
  ```
- 흐름: `/login`(Auth UI) → `/dashboard` 보호 → `/api/balance` 세션 검증 후 MOCK_* 반환 (실계좌 연동 시 교체)

### Branch B: Prisma + SQLite (자체 Auth + NextAuth)
- 브랜치: `feature/auth-prisma`
- 의존성: `prisma @prisma/client next-auth @auth/prisma-adapter bcryptjs @types/bcryptjs`
- `.env.local`
  ```
  DATABASE_URL="file:./dev.db"
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=your-random-secret
  # Mock data for /api/balance
  MOCK_BALANCE=1800000
  MOCK_INCOME=3200000
  MOCK_EXPENSE=1800000
  MOCK_SHARED_EXPENSE=720000
  MOCK_EXPECTED_REMAIN=1400000
  ```
- Prisma:
  ```bash
  npx prisma generate
  # (optional) npx prisma migrate dev --name init
  ```
- Auth 플로우: `/login` 커스텀 폼 → `/api/register` 가입(비밀번호 bcrypt 해시) → Credentials Provider 로그인 → `/dashboard` 보호 → `/api/balance` 세션 검증 후 MOCK_* 반환

### 배포/기타
- Vercel 배포 시 각 브랜치의 환경변수를 `.env`에 넣으면 됩니다.
- 실계좌 연동 시 오픈뱅킹/은행 API 키와 리다이렉트 URL을 서버 환경변수로 추가하고 `/api/balance` 호출부를 실제 API 호출로 교체하세요.
