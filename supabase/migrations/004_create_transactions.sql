-- 거래 내역 테이블 생성
-- Supabase Dashboard의 SQL Editor에서 실행하거나 migration으로 적용

CREATE TABLE IF NOT EXISTS transactions (
  -- 거래 고유 ID
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- 유저 고유 id, auth.users 테이블의 id와 연결됨
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  -- 거래 유형: 'income' (수입) 또는 'expense' (지출)
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  -- 거래 금액
  amount NUMERIC NOT NULL CHECK (amount > 0),
  -- 거래 설명/메모
  description TEXT,
  -- 거래 카테고리 (선택사항)
  category TEXT,
  -- 거래 날짜
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- 생성 시각 (UTC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- 수정 시각 (UTC, 자동 갱신됨)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- RLS (Row Level Security) 활성화
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- 각 사용자는 자기 자신의 거래만 조회할 수 있음 (SELECT)
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

-- 각 사용자는 자기 자신의 거래만 수정할 수 있음 (UPDATE)
CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

-- 각 사용자는 자신의 거래만 입력(insert) 가능
CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 각 사용자는 자신의 거래만 삭제 가능
CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- transactions가 UPDATE 될 때마다 updated_at 자동 갱신 트리거
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

