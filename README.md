## LifeTools Landing (App Router, TS, Tailwind)

### Branch A: Supabase Auth + Managed DB
1) 의존성
```bash
npm install @supabase/supabase-js @supabase/auth-ui-react @supabase/auth-ui-shared @supabase/auth-helpers-nextjs
```
2) 환경변수 (`.env.local`)
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
3) 실행
```bash
npm run dev
```
4) 흐름
- `/login` : Supabase Auth UI로 이메일 로그인/회원가입
- `/dashboard` : 서버에서 Supabase 세션 체크 후 보호된 페이지. `/api/balance` 호출 시 세션 검증.
- `/api/balance` : 현재는 MOCK_* 환경변수 기반. 실서비스에서는 userId에 매핑된 은행 토큰으로 오픈뱅킹/은행 API 호출 부분을 교체.

### Branch B: Prisma + SQLite (자체 Auth) — 준비 예정
- `feature/auth-prisma` 브랜치에서 Prisma 스키마, Auth.js, SQLite 로컬 DB → Postgres 전환 가이드 추가 예정.

### 배포/기타
- Vercel 배포 시 `.env`에 Supabase URL/Anon key를 넣으면 동일하게 동작합니다.
- 실계좌 연동 시에는 오픈뱅킹/은행 API의 클라이언트 키와 리다이렉트 URL을 서버 환경변수로 추가하고 `/api/balance` 호출부를 교체하세요.
