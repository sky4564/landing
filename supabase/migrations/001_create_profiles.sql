-- 사용자 프로필 테이블 생성
-- Supabase Dashboard의 SQL Editor에서 실행하거나 migration으로 적용

CREATE TABLE IF NOT EXISTS profiles (
  -- 유저 고유 id, auth.users 테이블의 id와 연결됨 (회원이 삭제되면 함께 삭제)
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  -- 사용자 이름 (닉네임 등)
  name TEXT,
  -- 나이 (선택)
  age INTEGER,
  -- 거주지/지역 등
  location TEXT, -- 거주지
  -- 생성 시각 (UTC)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  -- 수정 시각 (UTC, 자동 갱신됨)
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS (Row Level Security) 활성화: 행 단위 보안 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 각 사용자는 자기 자신의 프로필만 조회할 수 있음 (SELECT)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 각 사용자는 자기 자신의 프로필만 수정할 수 있음 (UPDATE)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 각 사용자는 자신의 id로만 프로필 입력(insert) 가능
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- updated_at 컬럼을 자동으로 갱신하는 함수 (update 시점마다 실행)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW()); -- 수정 시각을 현재로 변경
  RETURN NEW;
END;
$$ language 'plpgsql';

-- profiles가 UPDATE 될 때마다 updated_at 자동 갱신 트리거
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

