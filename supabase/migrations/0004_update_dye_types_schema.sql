-- dye_types 테이블을 PRD v2 스펙에 맞게 확장
-- 기존: id, name, description, created_at
-- 추가: total_capacity, default_unit_id, memo, is_active

ALTER TABLE dye_types
  ADD COLUMN IF NOT EXISTS total_capacity DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_unit_id UUID REFERENCES units(id),
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

