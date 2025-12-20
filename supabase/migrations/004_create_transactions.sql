-- 거래 내역 테이블 생성
-- 수입/지출 거래를 저장하는 테이블

CREATE TABLE IF NOT EXISTS transactions (
  -- 거래 고유 ID (자동 생성)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 유저 고유 id, auth.users 테이블의 id와 연결됨 (회원이 삭제되면 함께 삭제)
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- 거래 유형: 'income' (수입) 또는 'expense' (지출)
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  -- 거래 금액
  amount NUMERIC NOT NULL CHECK (amount > 0),
  -- 거래 카테고리 (예: 식비, 교통비, 급여, 용돈 등)
  category TEXT NOT NULL,
  -- 거래 설명/메모
  description TEXT,
  -- 거래 날짜
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- 통화 (기본값: KRW)
  currency TEXT DEFAULT 'KRW' NOT NULL,
  -- 생성 시각 (UTC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- 수정 시각 (UTC, 자동 갱신됨)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date DESC);

-- RLS (Row Level Security) 활성화: 행 단위 보안 활성화
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 각 사용자는 자기 자신의 거래만 조회할 수 있음 (SELECT)
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 각 사용자는 자기 자신의 거래만 수정할 수 있음 (UPDATE)
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- 각 사용자는 자신의 거래만 추가할 수 있음 (INSERT)
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 각 사용자는 자신의 거래만 삭제할 수 있음 (DELETE)
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at 컬럼을 자동으로 갱신하는 트리거
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

