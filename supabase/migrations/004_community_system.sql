-- ============================================================
-- COMMUNITY SYSTEM — Students & Community Members
-- ============================================================

-- STUDENTS TABLE (Auto-approved)
CREATE TABLE IF NOT EXISTS students (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT NOT NULL,
  college         TEXT NOT NULL,
  course          TEXT NOT NULL,
  state           TEXT NOT NULL,
  city            TEXT NOT NULL,
  interest        TEXT,
  reason          TEXT,
  status          TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'suspended')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNITY MEMBERS TABLE (Requires admin approval)
CREATE TABLE IF NOT EXISTS community_members (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('Mentor', 'Teacher', 'Contributor', 'Volunteer')),
  profession      TEXT NOT NULL,
  organization    TEXT NOT NULL,
  experience      INTEGER NOT NULL DEFAULT 0,
  skills          TEXT,
  linkedin        TEXT,
  reason          TEXT,
  photo_url       TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNITY POSTS TABLE (for discussions)
CREATE TABLE IF NOT EXISTS community_posts (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id       UUID NOT NULL,
  author_type     TEXT NOT NULL CHECK (author_type IN ('student', 'member')),
  author_name     TEXT NOT NULL,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  category        TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'doubt', 'discussion', 'announcement', 'resource')),
  is_answered     BOOLEAN DEFAULT FALSE,
  upvotes         INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNITY REPLIES TABLE
CREATE TABLE IF NOT EXISTS community_replies (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id         UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id       UUID NOT NULL,
  author_type     TEXT NOT NULL CHECK (author_type IN ('student', 'member')),
  author_name     TEXT NOT NULL,
  content         TEXT NOT NULL,
  is_best_answer  BOOLEAN DEFAULT FALSE,
  upvotes         INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AUTO-UPDATE updated_at for posts
CREATE OR REPLACE FUNCTION update_community_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS community_posts_updated_at ON community_posts;
CREATE TRIGGER community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW EXECUTE FUNCTION update_community_posts_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE students           ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_replies  ENABLE ROW LEVEL SECURITY;

-- STUDENTS: anyone can insert (join form); authenticated can read
CREATE POLICY "students_public_insert" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "students_auth_read" ON students FOR SELECT USING (true);
CREATE POLICY "students_admin_update" ON students FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "students_admin_delete" ON students FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COMMUNITY MEMBERS: anyone can insert; authenticated can read approved; admins can manage all
CREATE POLICY "community_members_public_insert" ON community_members FOR INSERT WITH CHECK (true);
CREATE POLICY "community_members_read" ON community_members FOR SELECT USING (true);
CREATE POLICY "community_members_admin_update" ON community_members FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "community_members_admin_delete" ON community_members FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COMMUNITY POSTS: authenticated can CRUD their own; everyone can read
CREATE POLICY "community_posts_read" ON community_posts FOR SELECT USING (true);
CREATE POLICY "community_posts_insert" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "community_posts_update" ON community_posts FOR UPDATE USING (true);
CREATE POLICY "community_posts_delete" ON community_posts FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- COMMUNITY REPLIES: same pattern
CREATE POLICY "community_replies_read" ON community_replies FOR SELECT USING (true);
CREATE POLICY "community_replies_insert" ON community_replies FOR INSERT WITH CHECK (true);
CREATE POLICY "community_replies_update" ON community_replies FOR UPDATE USING (true);
CREATE POLICY "community_replies_delete" ON community_replies FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================================
-- STORAGE BUCKET for member photos
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('community-photos', 'community-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "community_photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-photos');

CREATE POLICY "community_photos_anyone_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'community-photos');
