-- profiles 테이블에 이메일 주소 필드 추가
-- Supabase Dashboard의 SQL Editor에서 실행하거나 migration으로 적용

-- email 필드 추가 (사용자 이메일 주소 관리용)
-- 주의: auth.users 테이블에도 이메일이 있지만, profiles 테이블에도 저장하여 관리 편의성 향상
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- email에 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- 기존 사용자들의 이메일을 auth.users에서 가져와서 profiles에 저장
UPDATE profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- 주의사항:
-- 1. 이메일은 auth.users 테이블에서 관리되지만, profiles 테이블에도 저장하여 관리 편의성을 높입니다.
-- 2. 이메일 변경 시 auth.users와 profiles 모두 업데이트해야 합니다.
-- 3. 이메일은 사용자에게 표시하지 않고 관리 목적으로만 사용됩니다.

