-- 기존 관리자 계정에 원장(owner) 역할 부여
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "owner"}'::jsonb
WHERE email = 'remge@naver.com';
