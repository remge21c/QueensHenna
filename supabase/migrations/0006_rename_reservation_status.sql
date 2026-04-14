-- 1. 기존 CHECK 제약 제거
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_status_check;

-- 2. 데이터 업데이트 (제약 없는 상태에서 먼저 변경)
UPDATE reservations SET status = '예약' WHERE status = '예약완료';
UPDATE reservations SET status = '시술완료' WHERE status = '방문완료';

-- 3. 새 CHECK 제약 추가
ALTER TABLE reservations
  ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('예약', '시술완료', '취소', '노쇼', '대기'));
