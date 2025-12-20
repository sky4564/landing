-- 거래 삭제 RLS 정책 확인 및 수정
-- 이 마이그레이션은 기존 정책을 확인하고 필요시 재생성합니다.

-- 기존 DELETE 정책이 있는지 확인하고 삭제
DROP POLICY IF EXISTS "Users can delete own transactions" ON transactions;

-- DELETE 정책 재생성 (더 명확한 조건)
CREATE POLICY "Users can delete own transactions"
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 정책이 제대로 작동하는지 확인하기 위한 주석
-- 테스트 쿼리:
-- 1. 현재 사용자의 거래 조회: SELECT * FROM transactions WHERE user_id = auth.uid();
-- 2. 다른 사용자의 거래 삭제 시도 시 권한 오류가 발생해야 함
-- 3. 자신의 거래는 삭제 가능해야 함

