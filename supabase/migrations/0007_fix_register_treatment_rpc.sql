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

        UPDATE customer_dye_stocks
        SET current_amount = current_amount - v_usage.amount
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;

        UPDATE customer_dye_stocks
        SET status = CASE
            WHEN current_amount <= 0 THEN '소진'
            WHEN current_amount < 50 THEN '주의'
            ELSE '정상'
        END
        WHERE customer_id = p_customer_id AND dye_id = v_usage.dye_id;
    END LOOP;

    RETURN v_treatment_id;
END;
$$ LANGUAGE plpgsql;
