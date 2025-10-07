-- Unico por (tenant_id, member_id)
ALTER TABLE account
  ADD CONSTRAINT uq_account_tenant_member UNIQUE (tenant_id, member_id);

-- Funcion del trigger: SOLO crea/activa cuenta cuando role = 'SCOUT'
CREATE OR REPLACE FUNCTION trg_member_sync_account()
RETURNS trigger
LANGUAGE plpgsql
AS $$

BEGIN
  -- En insert con rol SCOUT como cuenta activa
  IF TG_OP = 'INSERT' AND NEW.role = 'SCOUT' THEN
    INSERT INTO account (tenant_id, member_id, active, created_at)
    VALUES (NEW.tenant_id, NEW.member_id, TRUE, now())
    ON CONFLICT (tenant_id, member_id) DO UPDATE
      SET active = TRUE;
    RETURN NEW;
  END IF;

  -- En update si el rol cambió a SCOUT garantizar cuenta activa
  IF TG_OP = 'UPDATE'
     AND (OLD.role IS DISTINCT FROM NEW.role)
     AND NEW.role = 'SCOUT' THEN
    INSERT INTO account (tenant_id, member_id, active, created_at)
    VALUES (NEW.tenant_id, NEW.member_id, TRUE, now())
    ON CONFLICT (tenant_id, member_id) DO UPDATE
      SET active = TRUE;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: reacciona a INSERT y a cambios de 'role' unicamente
DROP TRIGGER IF EXISTS member_sync_account ON member;

CREATE TRIGGER member_sync_account
AFTER INSERT OR UPDATE OF role
ON member
FOR EACH ROW
EXECUTE FUNCTION trg_member_sync_account();