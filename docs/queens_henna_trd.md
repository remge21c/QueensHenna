# 퀸즈헤나 고객관리 웹앱 TRD v1
(Technical Requirements Document)

---

## 1. 기술 스택

| 레이어 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 14.x |
| 언어 | TypeScript | 5.x |
| DB | Supabase (PostgreSQL) | - |
| DB 클라이언트 | supabase-js | 2.x |
| 인증 | Supabase Auth | - |
| 파일 저장 | Supabase Storage | - |
| 서버 로직 | Supabase Edge Functions | - |
| 스타일링 | Tailwind CSS | 3.x |
| UI 컴포넌트 | shadcn/ui | - |
| 상태관리 | Zustand | 4.x |
| 폼 관리 | React Hook Form + Zod | - |
| 날짜 처리 | date-fns | 3.x |
| 타입 생성 | Supabase CLI | - |

---

## 2. 프로젝트 구조

```
queens-henna/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (main)/
│   │   ├── layout.tsx          # 사이드바 포함 공통 레이아웃
│   │   ├── dashboard/
│   │   ├── customers/
│   │   │   ├── page.tsx        # 고객 목록
│   │   │   └── [id]/
│   │   │       └── page.tsx    # 고객 상세
│   │   ├── reservations/
│   │   ├── treatments/
│   │   ├── dyes/
│   │   ├── sms/
│   │   ├── sales/
│   │   ├── settings/
│   │   └── backup/
│   ├── api/                    # Next.js API Routes (필요 시)
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn/ui 기본 컴포넌트
│   ├── layout/                 # Sidebar, Header 등
│   ├── customers/              # 고객 관련 컴포넌트
│   ├── reservations/
│   ├── treatments/
│   ├── dyes/
│   └── shared/                 # 공통 컴포넌트
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저용 클라이언트
│   │   ├── server.ts           # 서버 컴포넌트용 클라이언트
│   │   └── middleware.ts       # Auth 미들웨어
│   ├── utils/
│   │   ├── dye.ts              # 잔량/횟수 계산 유틸
│   │   ├── sales.ts            # 매출 계산 유틸
│   │   └── format.ts           # 날짜/금액 포맷 유틸
│   └── constants.ts
├── hooks/                      # 커스텀 훅
│   ├── useCustomers.ts
│   ├── useReservations.ts
│   └── useDyeStocks.ts
├── types/
│   └── supabase.ts             # supabase CLI 자동 생성 타입
├── supabase/
│   ├── migrations/             # SQL 마이그레이션 파일
│   ├── functions/              # Edge Functions
│   │   └── send-sms/
│   └── seed.sql
├── middleware.ts               # Next.js 미들웨어 (Auth 라우팅)
└── ...config files
```

---

## 3. Supabase 설정

### 3.1 클라이언트 초기화

**브라우저용 (클라이언트 컴포넌트)**
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**서버용 (서버 컴포넌트, Server Actions)**
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'

export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

### 3.2 타입 자동 생성
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

스키마 변경 시마다 재실행하여 타입을 최신 상태로 유지한다.

### 3.3 환경변수
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=     # Edge Functions, 서버 전용
```

---

## 4. DB 스키마 (SQL)

### 4.1 users
```sql
create table users (
  id uuid primary key references auth.users(id),
  name text not null,
  role text not null check (role in ('owner', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
```

### 4.2 customers
```sql
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  birth_date date,
  memo text,
  profile_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.3 reservations
```sql
create table reservations (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  reserved_at timestamptz not null,
  status text not null default '예약완료'
    check (status in ('예약완료','방문완료','취소','노쇼','대기')),
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### 4.4 treatment_types
```sql
create table treatment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_price integer not null default 0,
  is_active boolean not null default true
);
```

### 4.5 treatments
```sql
create table treatments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  treatment_type_id uuid references treatment_types(id),
  treated_at timestamptz not null,
  base_price integer not null default 0,
  extra_price integer not null default 0,
  total_price integer generated always as (base_price + extra_price) stored,
  payment_method text check (payment_method in ('계좌이체','현금','카드')),
  memo text,
  created_at timestamptz not null default now()
);
```

### 4.6 units
```sql
create table units (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true
);
```

### 4.7 dye_types
```sql
create table dye_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_capacity numeric,
  default_unit_id uuid references units(id),
  memo text,
  is_active boolean not null default true
);
```

### 4.8 customer_recipes
```sql
create table customer_recipes (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  dye_id uuid not null references dye_types(id),
  default_use_amount numeric not null,
  unit_id uuid references units(id),
  memo text
);
```

### 4.9 customer_dye_stocks
```sql
create table customer_dye_stocks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  dye_id uuid not null references dye_types(id),
  purchased_amount numeric not null,
  current_amount numeric not null,
  unit_id uuid references units(id),
  purchased_at date,
  status text not null default '정상'
    check (status in ('정상','주의','경고','소진')),
  created_at timestamptz not null default now()
);
```

### 4.10 treatment_dye_usages
```sql
create table treatment_dye_usages (
  id uuid primary key default gen_random_uuid(),
  treatment_id uuid not null references treatments(id),
  customer_dye_stock_id uuid references customer_dye_stocks(id),
  dye_id uuid not null references dye_types(id),
  used_amount numeric not null,
  unit_id uuid references units(id)
);
```

### 4.11 backup_history
```sql
create table backup_history (
  id uuid primary key default gen_random_uuid(),
  backup_type text not null check (backup_type in ('manual','auto')),
  file_path text,
  created_at timestamptz not null default now(),
  created_by uuid references users(id),
  status text not null default 'success'
);
```

---

## 5. RLS 정책

모든 테이블에 RLS를 활성화한다. 기본 원칙은 로그인한 사용자만 접근 가능하다.

```sql
-- 예시: customers 테이블
alter table customers enable row level security;

create policy "로그인 사용자만 접근"
  on customers for all
  using (auth.role() = 'authenticated');
```

관리자 전용 테이블(users, backup_history 등)은 role 컬럼을 추가로 검사한다.

```sql
create policy "관리자만 접근"
  on backup_history for all
  using (
    exists (
      select 1 from users
      where id = auth.uid() and role = 'admin'
    )
  );
```

---

## 6. 핵심 쿼리 패턴

### 6.1 고객 목록 조회 (최근 방문일 포함)
```typescript
const { data } = await supabase
  .from('customers')
  .select(`
    *,
    treatments (treated_at)
  `)
  .order('name')
```

### 6.2 시술 등록 + 염색약 잔량 차감
시술 저장과 잔량 차감은 순서 보장이 필요하므로 Supabase RPC(PostgreSQL 함수)로 처리한다.

```sql
-- supabase/migrations/xxx_create_treatment_with_dye.sql
create or replace function save_treatment_with_dye(
  p_treatment jsonb,
  p_dye_usages jsonb
) returns uuid language plpgsql as $$
declare
  v_treatment_id uuid;
  v_usage jsonb;
begin
  -- 시술 저장
  insert into treatments (...)
  values (...) returning id into v_treatment_id;

  -- 염색약 잔량 차감
  for v_usage in select * from jsonb_array_elements(p_dye_usages) loop
    update customer_dye_stocks
    set current_amount = current_amount - (v_usage->>'used_amount')::numeric
    where id = (v_usage->>'customer_dye_stock_id')::uuid;
  end loop;

  return v_treatment_id;
end;
$$;
```

```typescript
const { data } = await supabase.rpc('save_treatment_with_dye', {
  p_treatment: treatmentData,
  p_dye_usages: dyeUsages,
})
```

### 6.3 염색약 상태 자동 계산
잔량 업데이트 시 status를 자동으로 갱신하는 트리거를 DB에 설정한다.

```sql
create or replace function update_dye_stock_status()
returns trigger language plpgsql as $$
declare
  v_remaining numeric;
  v_recipe_amount numeric;
begin
  select default_use_amount into v_recipe_amount
  from customer_recipes
  where customer_id = NEW.customer_id and dye_id = NEW.dye_id
  limit 1;

  if v_recipe_amount is null or v_recipe_amount = 0 then
    return NEW;
  end if;

  v_remaining := NEW.current_amount / v_recipe_amount;

  NEW.status := case
    when v_remaining <= 0 then '소진'
    when v_remaining <= 1 then '경고'
    when v_remaining <= 2 then '주의'
    else '정상'
  end;

  return NEW;
end;
$$;

create trigger trg_update_dye_stock_status
before update on customer_dye_stocks
for each row execute function update_dye_stock_status();
```

---

## 7. 인증 흐름

```
1. /login 페이지에서 ID/PW 입력
2. supabase.auth.signInWithPassword() 호출
3. 성공 시 세션 쿠키 저장
4. middleware.ts에서 모든 라우트 진입 시 세션 확인
5. 미인증 시 /login으로 리다이렉트
6. 인증 후 users 테이블에서 role 조회하여 권한 분기
```

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  const { supabase, response } = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
```

---

## 8. 파일 업로드 (프로필 사진)

```typescript
// 업로드
const { data, error } = await supabase.storage
  .from('profile-images')
  .upload(`customers/${customerId}.jpg`, file, { upsert: true })

// URL 조회
const { data: { publicUrl } } = supabase.storage
  .from('profile-images')
  .getPublicUrl(`customers/${customerId}.jpg`)

// customers 테이블에 경로 저장
await supabase
  .from('customers')
  .update({ profile_image_path: publicUrl })
  .eq('id', customerId)
```

**Storage 버킷 설정**
- 버킷명: `profile-images`
- 접근 권한: authenticated 사용자만 읽기/쓰기

---

## 9. 백업 구현

### 내보내기 (Export)
```typescript
// 전체 테이블 데이터를 JSON으로 수집
const tables = ['customers', 'reservations', 'treatments', ...]
const backup = {}

for (const table of tables) {
  const { data } = await supabase.from(table).select('*')
  backup[table] = data
}

// JSON 파일로 다운로드
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
const url = URL.createObjectURL(blob)
// <a> 태그로 다운로드 트리거
```

### 가져오기 (Import)
```typescript
// 업로드된 JSON 파일 파싱
const backup = JSON.parse(await file.text())

// 각 테이블에 upsert
for (const [table, rows] of Object.entries(backup)) {
  await supabase.from(table).upsert(rows as any[])
}
```

---

## 10. Edge Functions (SMS 연동 예정)

```
supabase/functions/
└── send-sms/
    └── index.ts
```

```typescript
// supabase/functions/send-sms/index.ts
Deno.serve(async (req) => {
  const { phone, message } = await req.json()

  // SMS API 호출 (추후 솔라피/알리고 등 선정 후 구현)
  const result = await fetch('https://sms-api-endpoint', {
    method: 'POST',
    body: JSON.stringify({ phone, message }),
    headers: { Authorization: `Bearer ${Deno.env.get('SMS_API_KEY')}` }
  })

  return new Response(JSON.stringify({ success: result.ok }))
})
```

---

## 11. 개발 환경 설정

### 필수 설치
```bash
# Node.js 20.x 이상
node -v

# Supabase CLI
npm install -g supabase

# 프로젝트 패키지
npm install
```

### 로컬 개발 시작
```bash
# Supabase 로컬 에뮬레이터 실행 (선택)
supabase start

# Next.js 개발 서버
npm run dev
```

### 타입 재생성 (스키마 변경 시)
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts
```

---

## 12. 결정 완료 사항
- ORM: 미사용 (supabase-js 직접 사용)
- 복잡한 트랜잭션: Supabase RPC (PostgreSQL 함수) 처리
- 자동 계산 로직: DB 트리거로 처리 (염색약 상태 등)
- 백업: 앱 레벨 JSON 내보내기/가져오기
- SMS: Edge Functions 경유, 업체 추후 선정
- 인증: Supabase Auth + 미들웨어 세션 검사
- 권한: RLS + users.role 컬럼 기반
- 스타일링: Tailwind CSS + shadcn/ui
