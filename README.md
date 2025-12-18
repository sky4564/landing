## LifeTools Landing (App Router, TS, Tailwind)

### Branch A: Supabase Auth + Managed DB

1. 의존성

```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/auth-helpers-nextjs
```

2. 환경변수 (`.env.local`)

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

3. Supabase 테이블 생성

#### 테이블 생성 방법

1. Supabase Dashboard → SQL Editor로 이동
2. `supabase/migrations/001_create_profiles.sql` 파일의 내용을 복사하여 실행
3. 또는 Supabase CLI를 사용하여 migration 적용

#### 테이블 생성 확인 방법

1. Supabase Dashboard → Table Editor로 이동
2. 왼쪽 사이드바에서 `profiles` 테이블이 보이는지 확인
3. 테이블이 없다면 SQL Editor에서 위의 SQL 스크립트를 실행

#### 문제 해결

- **"profiles 테이블이 존재하지 않습니다" 에러가 발생하는 경우**

  - Supabase Dashboard → SQL Editor에서 `001_create_profiles.sql` 파일의 내용을 실행
  - 실행 후 Table Editor에서 `profiles` 테이블이 생성되었는지 확인

- **"프로필에 접근할 수 있는 권한이 없습니다" 에러가 발생하는 경우**

  - Supabase Dashboard → Authentication → Policies에서 RLS 정책 확인
  - `profiles` 테이블에 다음 정책이 있는지 확인:
    - "Users can view own profile" (SELECT)
    - "Users can update own profile" (UPDATE)
    - "Users can insert own profile" (INSERT)

- **기존 사용자의 프로필이 없는 경우**
  - 프로필은 자동으로 생성됩니다 (빈 프로필)
  - 대시보드에서 "수정" 버튼을 눌러 정보를 입력할 수 있습니다

4. 실행

```bash
npm run dev
```

5. 흐름

- `/login` : Supabase Auth UI로 이메일 로그인/회원가입
- `/onboarding` : 회원가입 후 추가 정보 입력 (이름, 나이, 거주지)
- `/dashboard` : 서버에서 Supabase 세션 체크 후 보호된 페이지. `/api/balance` 호출 시 세션 검증.
- `/api/balance` : 현재는 MOCK\_\* 환경변수 기반. 실서비스에서는 userId에 매핑된 은행 토큰으로 오픈뱅킹/은행 API 호출 부분을 교체.
- `/api/user/profile` : 사용자 프로필 정보 조회 및 업데이트 API

### Branch B: Prisma + SQLite (자체 Auth) — 준비 예정

- `feature/auth-prisma` 브랜치에서 Prisma 스키마, Auth.js, SQLite 로컬 DB → Postgres 전환 가이드 추가 예정.

### 배포/기타

- Vercel 배포 시 `.env`에 Supabase URL/Anon key를 넣으면 동일하게 동작합니다.
- 실계좌 연동 시에는 오픈뱅킹/은행 API의 클라이언트 키와 리다이렉트 URL을 서버 환경변수로 추가하고 `/api/balance` 호출부를 교체하세요.
