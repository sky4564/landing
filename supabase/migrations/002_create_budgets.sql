-- 예산 테이블 생성
-- Supabase Dashboard의 SQL Editor에서 실행하거나 migration으로 적용

CREATE TABLE IF NOT EXISTS budgets (
  -- 유저 고유 id, auth.users 테이블의 id와 연결됨 (회원이 삭제되면 함께 삭제)
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  -- 현재 계좌 잔액
  balance NUMERIC DEFAULT 0 NOT NULL,
  -- 월 수입
  income NUMERIC DEFAULT 0 NOT NULL,
  -- 월 지출
  expense NUMERIC DEFAULT 0 NOT NULL,
  -- 공동 지출 금액
  shared_expense NUMERIC DEFAULT 0 NOT NULL,
  -- 예상 잔액 (수입 - 지출 - 공동지출)
  expected_remain NUMERIC DEFAULT 0 NOT NULL,
  -- 통화 (기본값: KRW)
  currency TEXT DEFAULT 'KRW' NOT NULL,
  -- 기간 (선택사항, '2024-01' 형식의 월별 구분, 나중에 확장 가능)
  period TEXT,
  -- 생성 시각 (UTC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- 수정 시각 (UTC, 자동 갱신됨)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 활성화: 행 단위 보안 활성화
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- 각 사용자는 자기 자신의 예산만 조회할 수 있음 (SELECT)
CREATE POLICY "Users can view own budget"
  ON budgets FOR SELECT
  USING (auth.uid() = id);

-- 각 사용자는 자기 자신의 예산만 수정할 수 있음 (UPDATE)
CREATE POLICY "Users can update own budget"
  ON budgets FOR UPDATE
  USING (auth.uid() = id);

-- 각 사용자는 자신의 id로만 예산 입력(insert) 가능
CREATE POLICY "Users can insert own budget"
  ON budgets FOR INSERT
  WITH CHECK (auth.uid() = id);

-- updated_at 컬럼을 자동으로 갱신하는 함수 (update 시점마다 실행)
-- 이미 profiles 테이블에서 생성했다면 중복 생성 방지
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW()); -- 수정 시각을 현재로 변경
  RETURN NEW;
END;
$$ language 'plpgsql';

-- budgets가 UPDATE 될 때마다 updated_at 자동 갱신 트리거
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

