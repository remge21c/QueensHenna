-- treatments에 예약 연결 및 상태 컬럼 추가
ALTER TABLE treatments
  ADD COLUMN IF NOT EXISTS reservation_id UUID REFERENCES reservations(id),
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';

-- 기존 데이터는 completed로 처리
UPDATE treatments SET status = 'completed' WHERE status IS NULL;

-- total_price가 generated column인 경우 일반 컬럼으로 변환 후 기본값 설정
ALTER TABLE treatments ALTER COLUMN total_price DROP EXPRESSION IF EXISTS;
ALTER TABLE treatments ALTER COLUMN total_price SET DEFAULT 0;
