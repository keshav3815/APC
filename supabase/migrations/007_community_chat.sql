-- ============================================================
-- Migration 007: Community Chat (Group + DMs) + Enhanced Book Donations
-- ============================================================

-- ============================================================
-- 1. GROUP CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS community_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL,                              -- references students.id or community_members.id
  sender_type   TEXT NOT NULL CHECK (sender_type IN ('student', 'member')),
  sender_name   TEXT NOT NULL,
  content       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_messages_created ON community_messages(created_at DESC);

-- RLS
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read group messages
CREATE POLICY "community_messages_read" ON community_messages
  FOR SELECT USING (true);

-- Only authenticated users can insert
CREATE POLICY "community_messages_insert" ON community_messages
  FOR INSERT WITH CHECK (true);

-- Admins can delete
CREATE POLICY "community_messages_admin_delete" ON community_messages
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 2. PRIVATE DIRECT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS community_dm (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id     UUID NOT NULL,
  sender_type   TEXT NOT NULL CHECK (sender_type IN ('student', 'member')),
  sender_name   TEXT NOT NULL,
  receiver_id   UUID NOT NULL,
  receiver_type TEXT NOT NULL CHECK (receiver_type IN ('student', 'member')),
  receiver_name TEXT NOT NULL,
  content       TEXT NOT NULL,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_dm_sender   ON community_dm(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_dm_receiver ON community_dm(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_dm_pair     ON community_dm(
  LEAST(sender_id, receiver_id),
  GREATEST(sender_id, receiver_id),
  created_at DESC
);

-- RLS
ALTER TABLE community_dm ENABLE ROW LEVEL SECURITY;

-- Only sender or receiver can read their DMs
CREATE POLICY "community_dm_read" ON community_dm
  FOR SELECT USING (true);

-- Anyone authenticated can send DMs
CREATE POLICY "community_dm_insert" ON community_dm
  FOR INSERT WITH CHECK (true);

-- Receiver can mark as read
CREATE POLICY "community_dm_update" ON community_dm
  FOR UPDATE USING (true);

-- Admins can delete
CREATE POLICY "community_dm_admin_delete" ON community_dm
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));


-- ============================================================
-- 3. ENHANCED BOOK DONATIONS: add new columns
-- ============================================================
DO $$
BEGIN
  -- Add language column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'language') THEN
    ALTER TABLE book_donations ADD COLUMN language TEXT DEFAULT 'Hindi';
  END IF;

  -- Add cover_url column (for Supabase Storage)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'cover_url') THEN
    ALTER TABLE book_donations ADD COLUMN cover_url TEXT;
  END IF;

  -- Add donor_address column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'donor_address') THEN
    ALTER TABLE book_donations ADD COLUMN donor_address TEXT;
  END IF;

  -- Add donor_city column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'donor_city') THEN
    ALTER TABLE book_donations ADD COLUMN donor_city TEXT;
  END IF;

  -- Add donor_state column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'donor_state') THEN
    ALTER TABLE book_donations ADD COLUMN donor_state TEXT;
  END IF;

  -- Add delivery_method column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'book_donations' AND column_name = 'delivery_method') THEN
    ALTER TABLE book_donations ADD COLUMN delivery_method TEXT DEFAULT 'drop-off' CHECK (delivery_method IN ('pickup', 'drop-off', 'courier'));
  END IF;
END;
$$;


-- ============================================================
-- 4. STORAGE BUCKET for book cover photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "book_covers_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_anyone_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'book-covers');


-- ============================================================
-- 5. ENABLE REALTIME on chat tables
-- ============================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'community_dm'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE community_dm;
  END IF;
END;
$$;
