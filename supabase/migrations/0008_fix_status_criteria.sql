-- 시술 완료 시 염색약 잔량 상태 판정 기준 수정
-- 변경 전: 절대량 기준 (< 50 → 주의) — 단위(g/ml)에 무관하게 판정되는 오류
-- 변경 후: 소진 여부만 DB status에 기록, 주의/경고는 프론트엔드에서 remaining_uses 기반으로 판정

CREATE OR REPLACE FUNCTION register_treatment(
    p_customer_id UUID,
    p_treatment_type_id UUID,
    p_total_price INTEGER,
    p_payment_method TEXT,
    p_memo TEXT,
    p_treated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    p_usages JSONB DEFAULT '[]'
) RETURNS UUID AS $$
DECLARE
    v_treatment_id UUID;
    v_usage RECORD;
BEGIN
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
        p_treated_at
    ) RETURNING id INTO v_treatment_id;

    FOR v_usage IN SELECT * FROM jsonb_to_recordset(p_usages) AS x(dye_id UUID, unit_id UUID, amount DECIMAL)
    LOOP
        INSERT INTO treatment_usage (treatment_id, dye_id, unit_id, amount)
        VALUES (v_treatment_id, v_usage.dye_id, v_usage.unit_id, v_usage.amount);

        -- 절대값 차감 (현행 유지)
        UPDATE customer_dye_stocks
        SET current_amount = current_amount - v_usage.amount
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;

        -- 소진 여부만 DB에 기록; 주의/경고는 프론트엔드가 remaining_uses 기반으로 판정
        UPDATE customer_dye_stocks
        SET status = CASE
            WHEN current_amount <= 0 THEN '소진'
            ELSE '정상'
        END
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;
    END LOOP;

    RETURN v_treatment_id;
END;
$$ LANGUAGE plpgsql;
