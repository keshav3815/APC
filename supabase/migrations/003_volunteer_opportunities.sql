-- ============================================================
-- VOLUNTEER OPPORTUNITIES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS volunteer_opportunities (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title             TEXT NOT NULL,
  description       TEXT,
  time_commitment   TEXT,
  skills_required   TEXT[],
  is_active         BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE volunteer_opportunities ENABLE ROW LEVEL SECURITY;

-- Anyone can read active opportunities
CREATE POLICY "volunteer_opportunities_public_read" ON volunteer_opportunities
  FOR SELECT USING (true);

-- Only admins can manage
CREATE POLICY "volunteer_opportunities_admin_insert" ON volunteer_opportunities
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "volunteer_opportunities_admin_update" ON volunteer_opportunities
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "volunteer_opportunities_admin_delete" ON volunteer_opportunities
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Seed default opportunities
INSERT INTO volunteer_opportunities (title, description, time_commitment, skills_required) VALUES
('Event Organization', 'Help organize and manage community events', '5-10 hours/week', ARRAY['Event management', 'Communication']),
('Book Distribution', 'Coordinate book donations and distributions', '3-5 hours/week', ARRAY['Logistics', 'Community outreach']),
('Teaching & Mentoring', 'Teach or mentor underprivileged students', '4-8 hours/week', ARRAY['Teaching', 'Patience', 'Subject expertise']),
('Digital Content', 'Help create content for social media and website', '5-10 hours/week', ARRAY['Writing', 'Design', 'Social media']);
