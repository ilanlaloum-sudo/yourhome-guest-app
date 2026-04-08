-- Webhook automatique : quand une reservation est creee -> envoyer magic link
SELECT supabase_functions.http_request(
  'POST',
  current_setting('app.supabase_url') || '/functions/v1/on-reservation-created',
  '{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.service_role_key') || '"}',
  '{}',
  '1000'
);

-- Trigger sur reservations INSERT
CREATE OR REPLACE FUNCTION trigger_on_reservation_created()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/on-reservation-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object('reservation_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_reservation_created ON reservations;
CREATE TRIGGER on_reservation_created
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_on_reservation_created();

-- Trigger sur reservations UPDATE -> checkout
CREATE OR REPLACE FUNCTION trigger_on_checkout()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    PERFORM net.http_post(
      url := current_setting('app.supabase_url', true) || '/functions/v1/on-checkout',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
      ),
      body := jsonb_build_object('reservation_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_checkout ON reservations;
CREATE TRIGGER on_checkout
  AFTER UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION trigger_on_checkout();

-- Trigger sur reviews INSERT -> moderation automatique
CREATE OR REPLACE FUNCTION trigger_on_review_submitted()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/on-review-submitted',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_review_submitted ON reviews;
CREATE TRIGGER on_review_submitted
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION trigger_on_review_submitted();

-- Trigger sur auth.users INSERT -> lier guest automatiquement
CREATE OR REPLACE FUNCTION trigger_on_auth_user()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.supabase_url', true) || '/functions/v1/on-auth-user',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.service_role_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'record', row_to_json(NEW)
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_on_auth_user();
