-- 8. 예약 (Reservations)
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    reserved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT '예약완료', -- '예약완료', '방문완료', '노쇼', '취소'
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for date-based queries
CREATE INDEX IF NOT EXISTS idx_reservations_reserved_at ON reservations (reserved_at);

-- RLS (Row Level Security)
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON reservations
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
