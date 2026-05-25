-- Migration 010: RPC for atomic assessment activation
-- This function is NOT currently used by the application — activation is done
-- client-side with two sequential UPDATEs in /api/analyze GET.
-- This migration is provided as a future upgrade path for true atomicity.
-- To use: call rpc('activate_assessment', { p_id: <assessment row id> })
-- and remove the two-step UPDATE logic from /api/analyze GET.

CREATE OR REPLACE FUNCTION activate_assessment(p_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id BIGINT;
BEGIN
  -- Get the user_id for this assessment
  SELECT user_id INTO v_user_id
  FROM assessments
  WHERE id = p_id;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Assessment % not found', p_id;
  END IF;

  -- Deactivate all other active assessments for this user
  UPDATE assessments
  SET is_active = false
  WHERE user_id = v_user_id
    AND is_active = true
    AND id != p_id;

  -- Activate the target assessment
  UPDATE assessments
  SET is_active = true
  WHERE id = p_id;
END;
$$;
