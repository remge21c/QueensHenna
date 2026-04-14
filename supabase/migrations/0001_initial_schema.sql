-- Queens Henna CRM Initial Schema

-- 1. 고객 (Customers)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    birth_date DATE,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 염색약 종류 (Dye Types)
CREATE TABLE dye_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 단위 (Units)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., 'g', 'ml', 'ea'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. 고객별 염색약 잔량 (Customer Dye Stocks)
CREATE TABLE customer_dye_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    dye_id UUID REFERENCES dye_types(id),
    unit_id UUID REFERENCES units(id),
    purchased_amount DECIMAL NOT NULL, -- 구매 총량
    current_amount DECIMAL NOT NULL,   -- 현재 잔량
    status TEXT DEFAULT '정상',         -- '정상', '주의', '소진' 등
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 시술 타입 (Treatment Types)
CREATE TABLE treatment_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    base_price INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. 시술 기록 (Treatments)
CREATE TABLE treatments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    treatment_type_id UUID REFERENCES treatment_types(id),
    treated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    total_price INTEGER NOT NULL,
    payment_method TEXT, -- '현금', '카드', '계좌이체'
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. 고객별 레시피 (Customer Recipes)
-- 한 시술에 여러 염색약을 섞을 수 있음.
CREATE TABLE customer_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    dye_id UUID REFERENCES dye_types(id),
    unit_id UUID REFERENCES units(id),
    default_use_amount DECIMAL NOT NULL, -- 1회 시술 시 사용량
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 샘플 데이터 입력 (초기 구성을 위함)
INSERT INTO dye_types (name) VALUES ('내츄럴 브라운'), ('오렌지 헤나'), ('레드');
INSERT INTO units (name) VALUES ('g'), ('ml');
INSERT INTO treatment_types (name, base_price) VALUES ('전체 염색', 50000), ('뿌리 염색', 30000) ON CONFLICT (name) DO NOTHING;