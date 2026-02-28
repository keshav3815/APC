-- ============================================================
-- COMPETITIVE EXAM HUB — Database Schema
-- ============================================================

-- EXAMS TABLE
CREATE TABLE IF NOT EXISTS exams (
  id                     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_name              TEXT NOT NULL,
  organization           TEXT NOT NULL,
  level                  TEXT NOT NULL CHECK (level IN ('Central', 'State')),
  state                  TEXT,
  description            TEXT,
  eligibility            TEXT,
  qualification          TEXT,
  age_limit              TEXT,
  application_start_date DATE,
  application_last_date  DATE,
  exam_date              DATE,
  official_website       TEXT,
  notification_pdf       TEXT,
  application_fee        TEXT,
  selection_process      TEXT,
  status                 TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'Closed', 'Coming Soon')),
  is_active              BOOLEAN DEFAULT TRUE,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED EXAMS TABLE
CREATE TABLE IF NOT EXISTS saved_exams (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id     UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, exam_id)
);

-- EXAM REMINDERS TABLE
CREATE TABLE IF NOT EXISTS exam_reminders (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  exam_id        UUID REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  reminder_type  TEXT NOT NULL DEFAULT 'both' CHECK (reminder_type IN ('application_deadline', 'exam_date', 'both')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, exam_id)
);

-- AUTO-UPDATE updated_at
CREATE OR REPLACE FUNCTION update_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS exams_updated_at ON exams;
CREATE TRIGGER exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW EXECUTE FUNCTION update_exams_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE exams         ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_exams   ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_reminders ENABLE ROW LEVEL SECURITY;

-- EXAMS: anyone can read; only admins can write
CREATE POLICY "exams_public_read"  ON exams FOR SELECT USING (true);
CREATE POLICY "exams_admin_insert" ON exams FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "exams_admin_update" ON exams FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "exams_admin_delete" ON exams FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- SAVED_EXAMS: users own their rows
CREATE POLICY "saved_exams_own_read"   ON saved_exams FOR SELECT  TO authenticated USING (student_id = auth.uid());
CREATE POLICY "saved_exams_own_insert" ON saved_exams FOR INSERT  TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "saved_exams_own_delete" ON saved_exams FOR DELETE  TO authenticated USING (student_id = auth.uid());

-- EXAM_REMINDERS: users own their rows
CREATE POLICY "reminders_own_read"   ON exam_reminders FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "reminders_own_insert" ON exam_reminders FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid());
CREATE POLICY "reminders_own_update" ON exam_reminders FOR UPDATE TO authenticated USING (student_id = auth.uid());
CREATE POLICY "reminders_own_delete" ON exam_reminders FOR DELETE TO authenticated USING (student_id = auth.uid());

-- ============================================================
-- SEED DATA — Sample Competitive Exams
-- ============================================================

INSERT INTO exams (exam_name, organization, level, state, description, eligibility, qualification, age_limit, application_start_date, application_last_date, exam_date, official_website, application_fee, selection_process, status) VALUES

-- CENTRAL EXAMS
('UPSC Civil Services Examination (CSE) 2026',
 'Union Public Service Commission (UPSC)', 'Central', NULL,
 'The UPSC Civil Services Examination is conducted for recruitment to various Civil Services of the Government of India including IAS, IPS, IFS and other allied services. It is one of the most prestigious examinations in India.',
 'Citizen of India. Minimum graduation from a recognised university. Must be at least 21 years old.',
 'Bachelor''s Degree in Any Discipline from a Recognised University',
 '21–32 years (relaxation for SC/ST/OBC/PwD)',
 '2026-02-12', '2026-03-04', '2026-05-25',
 'https://upsc.gov.in',
 '₹100 (Fee exempted for Female/SC/ST/PwD candidates)',
 'Preliminary Examination → Main Examination → Personality Test (Interview)',
 'Open'),

('SSC Combined Graduate Level (CGL) 2025–26',
 'Staff Selection Commission (SSC)', 'Central', NULL,
 'SSC CGL is conducted for recruitment to Group B and Group C posts in various Ministries/Departments/Organisations of the Government of India. Posts include Inspector, Sub-Inspector, Assistant Audit Officer, etc.',
 'Graduate from a recognised university. Age between 18–32 years depending on post.',
 'Bachelor''s Degree in Any Subject from a Recognised University',
 '18–32 years (varies by post; relaxation available)',
 '2026-01-20', '2026-02-28', '2026-04-20',
 'https://ssc.nic.in',
 '₹100 (Exempted for Female/SC/ST/PwD/ESM)',
 'Tier-I (CBT) → Tier-II (CBT) → Document Verification / Skill Test',
 'Open'),

('IBPS PO 2026 (Common Recruitment Process)',
 'Institute of Banking Personnel Selection (IBPS)', 'Central', NULL,
 'IBPS CRP PO/MT recruitment for Probationary Officers and Management Trainees in participating Public Sector Banks. Selected candidates are posted across India.',
 'Graduate in any discipline. Age 20–30 years. Proficiency in official language of the State/UT for which applied.',
 'Any Graduate from a Recognised University (60% preferred)',
 '20–30 years (relaxation as per Govt rules)',
 '2026-03-01', '2026-03-31', '2026-06-14',
 'https://www.ibps.in',
 '₹850 for GEN/EWS/OBC; ₹175 for SC/ST/PwD',
 'Preliminary Exam → Main Exam → Interview',
 'Coming Soon'),

('GATE 2027 (Graduate Aptitude Test in Engineering)',
 'IIT/NIT (organized by IIT Roorkee 2027)', 'Central', NULL,
 'GATE tests comprehensive understanding of various undergraduate subjects in Engineering, Technology, Architecture and Science. Valid for admissions to M.Tech/PhD programs and PSU recruitment.',
 'Bachelor''s or Master''s degree in Engineering/Science/Commerce/Arts. Final year students also eligible.',
 'B.E./B.Tech/B.Arch/B.Sc (Research)/BS (4-year)/M.Sc/MCA or equivalent',
 'No age limit',
 '2026-08-24', '2026-09-28', '2027-02-01',
 'https://gate.iitg.ac.in',
 '₹1800 for GEN/OBC; ₹900 for SC/ST/PwD/Female',
 'Single Paper CBT Exam → Score Valid for 3 Years',
 'Coming Soon'),

('NDA & NA Examination (I) 2026',
 'Union Public Service Commission (UPSC)', 'Central', NULL,
 'NDA exam conducted for admission to Army, Navy and Air Force wings of NDA for 145th Course and Naval Academy for 107th Indian Naval Academy Course. Selected candidates undergo 3-year training.',
 'Only male candidates can apply. Must be unmarried. Passed or appearing in Class 12.',
 'Class 10+2 / Equivalent (Science stream for Air Force and Navy)',
 '16.5–19.5 years as of 01 July 2026',
 '2026-01-13', '2026-02-11', '2026-04-13',
 'https://upsc.gov.in',
 '₹100 (Exempted for SC/ST/Sons of JCO/NCO/OR)',
 'Written Exam (Maths + General Ability) → SSB Interview → Medical',
 'Closed'),

('RRB NTPC Graduate Level 2025',
 'Railway Recruitment Boards (RRB)', 'Central', NULL,
 'RRB NTPC recruitment for Non-Technical Popular Category posts like Junior Clerk cum Typist, Accounts Clerk, Junior Time Keeper, Trains Clerk, Traffic Assistant, Goods Guard, Senior Commercial cum Ticket Clerk etc.',
 'Graduate in any discipline or final year student from recognised university.',
 'Bachelor''s Degree / 12th Pass depending on post',
 '18–30 years (varies by post)',
 '2025-11-14', '2025-12-13', '2026-03-15',
 'https://indianrailways.gov.in',
 '₹500 for GEN/OBC; ₹250 for SC/ST/Female/Minority/EBC',
 'CBT Stage 1 → CBT Stage 2 → Typing / CBAT → Document Verification',
 'Closed'),

-- STATE EXAMS
('Bihar Public Service Commission (BPSC) 70th CCE',
 'Bihar Public Service Commission', 'State', 'Bihar',
 'BPSC 70th Combined Competitive Examination for recruitment to various State Service Gazetted posts including SDO, DSP, BDO and other Class-A and Class-B posts in Bihar Government.',
 'Graduate from a recognised university. Resident of Bihar preferred for some posts.',
 'Bachelor''s Degree from a Recognised University',
 '20–37 years for GEN; relaxation for BC/EBC/SC/ST/Female',
 '2026-02-25', '2026-03-20', '2026-04-28',
 'https://www.bpsc.bih.nic.in',
 '₹600 for GEN/BC/EBC; ₹150 for SC/ST of Bihar',
 'Preliminary Test → Main Examination → Interview',
 'Open'),

('UPPSC PCS 2026 (UP Combined State / Upper Subordinate Service)',
 'Uttar Pradesh Public Service Commission', 'State', 'Uttar Pradesh',
 'UP PCS examination for recruitment to gazetted posts in Group A and Group B in various departments of Uttar Pradesh Government including SDM, DSP, ARTO, etc.',
 'Graduate from a recognised university. Must be a permanent resident of UP for some posts.',
 'Any Graduate Degree from a Recognised University',
 '21–40 years (with relaxation for reserved categories)',
 '2026-02-10', '2026-03-12', '2026-05-17',
 'https://uppsc.up.nic.in',
 '₹125 for GEN/OBC; ₹65 for SC/ST; ₹25 for PwD',
 'Preliminary Exam → Main Exam → Interview',
 'Open'),

('MPPSC State Service Exam 2026',
 'Madhya Pradesh Public Service Commission', 'State', 'Madhya Pradesh',
 'MPSC State Service Exam for appointment to various administrative posts in Madhya Pradesh. Posts include Deputy Collector, DSP, Commercial Tax Officer, District Registrar, etc.',
 'Graduate from a recognised university. Age and domicile as per MP govt norms.',
 'Bachelor''s Degree in Any Subject',
 '21–40 years (relaxation for OBC/SC/ST/PwD of MP)',
 '2026-03-01', '2026-03-31', '2026-06-07',
 'https://mppsc.mp.gov.in',
 '₹500 for GEN; ₹250 for MP domicile OBC/SC/ST/PwD',
 'Preliminary Exam → Mains → Interview',
 'Coming Soon'),

('RPSC RAS/RTS 2026 (Rajasthan State and Subordinate Services)',
 'Rajasthan Public Service Commission', 'State', 'Rajasthan',
 'RPSC RAS/RTS Combined Competitive Examination for Class-I and Class-II posts in Rajasthan Government departments including RAS, RPS, RFoS and other allied services.',
 'Graduate from a recognised university. Rajasthan domicile mandatory.',
 'Graduate in any discipline from a Recognised University',
 '21–40 years (relaxation for OBC/SC/ST/PwD of Rajasthan)',
 '2026-04-01', '2026-04-30', '2026-07-19',
 'https://rpsc.rajasthan.gov.in',
 '₹350 for GEN; ₹250 for OBC/BC; ₹150 for SC/ST/PwD/EWS',
 'Preliminary Exam → Main Exam → Interview',
 'Coming Soon');
