/*
# Billiard Club Schema — Tables, Bookings, Pricing, Settings

1. New Tables
- `tables` — the 6 billiard tables (id 1..6, name, image_url, is_vip)
- `bookings` — reservations with date, start_time, end_time, status (pending/confirmed/completed/cancelled), client name + phone, table_id
- `pricing` — editable price tiers (weekday/weekend/vip) with price per hour
- `club_settings` — single-row table for club name, telegram bot username, address, phone, hours, etc.

2. Security
- Enable RLS on all tables.
- This is a NO-AUTH app (no sign-in for visitors). Admin panel uses a simple password check via edge function with service role key, NOT Supabase auth.
- Allow anon + authenticated to SELECT tables, pricing, club_settings, and bookings (so visitors can see availability).
- INSERT/UPDATE/DELETE on bookings is restricted to the service role (edge functions) — anon cannot write directly. This prevents double-booking and ensures server-side validation.
- An admin edge function (protected by ADMIN_PASSWORD secret) handles all mutations.

3. Important Notes
- Bookings store date + start_time + end_time. Overlap is checked server-side in the edge function before insert.
- Status flow: pending → confirmed → completed (auto when end_time passes) → cancelled.
- A cron-like edge function or on-demand check marks bookings as completed when their end time has passed.
- All times are stored as timestamptz; the club timezone is Asia/Tbilisi (Georgia). Server-side logic uses AT TIME ZONE 'Asia/Tbilisi'.
*/

-- ===== TABLES =====
CREATE TABLE IF NOT EXISTS tables (
  id smallint PRIMARY KEY,
  name text NOT NULL,
  image_url text,
  is_vip boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL DEFAULT 0
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_tables" ON tables;
CREATE POLICY "anon_read_tables" ON tables FOR SELECT
  TO anon, authenticated USING (true);

-- ===== BOOKINGS =====
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id smallint NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  booking_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','completed','cancelled')),
  telegram_chat_id bigint,
  telegram_message_id bigint,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_bookings" ON bookings;
CREATE POLICY "anon_read_bookings" ON bookings FOR SELECT
  TO anon, authenticated USING (true);

-- No INSERT/UPDATE/DELETE policies for anon — only the service role (edge functions) can mutate bookings.

-- Index for overlap queries
CREATE INDEX IF NOT EXISTS idx_bookings_table_date ON bookings(table_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);

-- ===== PRICING =====
CREATE TABLE IF NOT EXISTS pricing (
  id smallint PRIMARY KEY,
  tier_key text NOT NULL UNIQUE,
  tier_name text NOT NULL,
  price_per_hour integer NOT NULL,
  sort_order smallint NOT NULL DEFAULT 0
);

ALTER TABLE pricing ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_pricing" ON pricing;
CREATE POLICY "anon_read_pricing" ON pricing FOR SELECT
  TO anon, authenticated USING (true);

-- ===== CLUB SETTINGS =====
CREATE TABLE IF NOT EXISTS club_settings (
  id smallint PRIMARY KEY DEFAULT 1,
  club_name text NOT NULL DEFAULT 'NEON BILLIARD',
  tagline text NOT NULL DEFAULT 'БИЛЬЯРД. НОВАЯ ЭРА.',
  subtitle text NOT NULL DEFAULT 'Играй. Бронируй. Побеждай.',
  telegram_bot_username text NOT NULL DEFAULT 'NeonBilliardBot',
  address text NOT NULL DEFAULT 'Батуми, ул. Руставели, 1',
  phone text NOT NULL DEFAULT '+995 555 123 456',
  hours_weekday text NOT NULL DEFAULT '12:00 — 03:00',
  hours_weekend text NOT NULL DEFAULT '10:00 — 04:00',
  map_embed_url text NOT NULL DEFAULT '',
  about_text text NOT NULL DEFAULT 'Премиальный бильярдный клуб в самом сердце ночного Батуми. Шесть профессиональных столов, атмосфера luxury-лаунжа и технологии будущего.',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE club_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_club_settings" ON club_settings;
CREATE POLICY "anon_read_club_settings" ON club_settings FOR SELECT
  TO anon, authenticated USING (true);

-- ===== SEED DATA =====
INSERT INTO tables (id, name, is_vip, sort_order) VALUES
  (1, 'Стол №1', false, 1),
  (2, 'Стол №2', false, 2),
  (3, 'Стол №3', false, 3),
  (4, 'Стол №4', false, 4),
  (5, 'Стол №5', false, 5),
  (6, 'Стол №6', true, 6)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pricing (id, tier_key, tier_name, price_per_hour, sort_order) VALUES
  (1, 'weekday', 'Будни', 40, 1),
  (2, 'weekend', 'Выходные', 60, 2),
  (3, 'vip', 'VIP', 100, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO club_settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ===== UPDATED_AT TRIGGER =====
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bookings_updated ON bookings;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_club_settings_updated ON club_settings;
CREATE TRIGGER trg_club_settings_updated BEFORE UPDATE ON club_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();