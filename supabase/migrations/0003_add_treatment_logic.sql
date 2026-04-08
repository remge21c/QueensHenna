-- Phase 5: 시술 기록 상세 및 재고 차급 로직
-- 1. 시술 시 사용된 약재 상세 기록 테이블
CREATE TABLE IF NOT EXISTS treatment_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    treatment_id UUID REFERENCES treatments(id) ON DELETE CASCADE,
    dye_id UUID REFERENCES dye_types(id),
    unit_id UUID REFERENCES units(id),
    amount DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 시술 등록 및 재고 차감을 위한 RPC (Stored Procedure)
-- 이 RPC는 시술 정보를 저장하고, 사용된 각 약재의 수량을 고객의 잔량에서 차감합니다.
CREATE OR REPLACE FUNCTION register_treatment(
    p_customer_id UUID,
    p_treatment_type_id UUID,
    p_total_price INTEGER,
    p_payment_method TEXT,
    p_memo TEXT,
    p_usages JSONB -- [{dye_id: UUID, unit_id: UUID, amount: number}]
) RETURNS UUID AS $$
DECLARE
    v_treatment_id UUID;
    v_usage RECORD;
BEGIN
    -- 1. 시술 기본 정보 저장
    INSERT INTO treatments (
        customer_id, 
        treatment_type_id, 
        total_price, 
        payment_method, 
        memo, 
        treated_at
    ) VALUES (
        p_customer_id, 
        p_treatment_type_id, 
        p_total_price, 
        p_payment_method, 
        p_memo, 
        now()
    ) RETURNING id INTO v_treatment_id;

    -- 2. 사용된 약재 기록 및 재고 차감
    FOR v_usage IN SELECT * FROM jsonb_to_recordset(p_usages) AS x(dye_id UUID, unit_id UUID, amount DECIMAL)
    LOOP
        -- 상세 기록 저장
        INSERT INTO treatment_usage (treatment_id, dye_id, unit_id, amount)
        VALUES (v_treatment_id, v_usage.dye_id, v_usage.unit_id, v_usage.amount);

        -- 고객 재고 차감
        UPDATE customer_dye_stocks
        SET current_amount = current_amount - v_usage.amount,
            updated_at = now()
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;
        
        -- 재고 상태 자동 업데이트 (잔량이 0 이하이면 '소진')
        UPDATE customer_dye_stocks
        SET status = CASE WHEN current_amount <= 0 THEN '소진' 
                          WHEN current_amount < 50 THEN '주의' 
                          ELSE '정상' END
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;
    END LOOP;

    RETURN v_treatment_id;
END;
$$ LANGUAGE plpgsql;
