-- ============================================================
-- Migration 006: Crawler Runs + Auto Exam Status Update
-- ============================================================

-- Track every crawler execution (automated or manual)
CREATE TABLE IF NOT EXISTS crawler_runs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type      text NOT NULL DEFAULT 'scheduled',       -- 'scheduled' | 'manual' | 'webhook'
  status        text NOT NULL DEFAULT 'running',         -- 'running' | 'success' | 'partial' | 'failed'
  scrapers_run  text[] DEFAULT '{}',                     -- e.g. {'UPSC','SSC','BPSC'}
  exams_found   int DEFAULT 0,
  exams_new     int DEFAULT 0,
  exams_updated int DEFAULT 0,
  exams_closed  int DEFAULT 0,
  errors        int DEFAULT 0,
  error_log     text,
  duration_ms   int,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  metadata      jsonb DEFAULT '{}'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS idx_crawler_runs_started ON crawler_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_runs_status  ON crawler_runs(status);

-- RLS
ALTER TABLE crawler_runs ENABLE ROW LEVEL SECURITY;

-- Admins can read/write
CREATE POLICY "Admins can manage crawler_runs"
  ON crawler_runs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Service role (used by API routes) bypasses RLS
-- Anon/authenticated need explicit read for the admin dashboard
CREATE POLICY "Authenticated users can read crawler_runs"
  ON crawler_runs FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================
-- DB function: auto-update exam statuses based on dates
-- Called by the cron API route
-- ============================================================
CREATE OR REPLACE FUNCTION update_exam_statuses()
RETURNS TABLE(closed_count int, opened_count int, coming_soon_count int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_closed   int := 0;
  v_opened   int := 0;
  v_coming   int := 0;
BEGIN
  -- Mark exams as 'Closed' if application_last_date has passed
  WITH updated AS (
    UPDATE exams
    SET status = 'Closed',
        updated_at = now()
    WHERE is_active = true
      AND status != 'Closed'
      AND application_last_date IS NOT NULL
      AND application_last_date::date < CURRENT_DATE
    RETURNING id
  )
  SELECT count(*) INTO v_closed FROM updated;

  -- Mark exams as 'Open' if we are within the application window
  WITH updated AS (
    UPDATE exams
    SET status = 'Open',
        updated_at = now()
    WHERE is_active = true
      AND status != 'Open'
      AND (application_start_date IS NULL OR application_start_date::date <= CURRENT_DATE)
      AND (application_last_date IS NULL OR application_last_date::date >= CURRENT_DATE)
      AND status = 'Coming Soon'
    RETURNING id
  )
  SELECT count(*) INTO v_opened FROM updated;

  -- Mark exams as 'Coming Soon' if start date is in the future
  WITH updated AS (
    UPDATE exams
    SET status = 'Coming Soon',
        updated_at = now()
    WHERE is_active = true
      AND status NOT IN ('Coming Soon', 'Closed')
      AND application_start_date IS NOT NULL
      AND application_start_date::date > CURRENT_DATE
    RETURNING id
  )
  SELECT count(*) INTO v_coming FROM updated;

  RETURN QUERY SELECT v_closed, v_opened, v_coming;
END;
$$;

-- ============================================================
-- Enable Realtime on exams table for live updates
-- ============================================================
DO $$
BEGIN
  -- Add exams to realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'exams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE exams;
  END IF;

  -- Add crawler_runs to realtime too
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'crawler_runs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE crawler_runs;
  END IF;
END;
$$;
