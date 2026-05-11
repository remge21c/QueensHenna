-- 앱 전역 설정을 key-value JSONB로 저장하는 테이블
-- 백업 설정, SMS 템플릿, 시스템 설정 등에 재사용
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owner_select" ON app_settings;
CREATE POLICY "owner_select" ON app_settings FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');

DROP POLICY IF EXISTS "owner_all" ON app_settings;
CREATE POLICY "owner_all" ON app_settings FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'owner');
