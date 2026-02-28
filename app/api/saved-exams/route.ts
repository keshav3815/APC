import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/saved-exams
 * Returns all exams saved by the authenticated user, newest first.
 * Optionally filter by: search, status, level
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const status = searchParams.get('status');
  const level  = searchParams.get('level');

  let query = supabase
    .from('saved_exams')
    .select(`
      id,
      created_at,
      exam:exams (
        id, exam_name, organization, level, state, status,
        application_last_date, exam_date, official_website,
        notification_pdf, description, is_active
      )
    `)
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Filter in-memory (Supabase doesn't support filtering on joined columns directly
  // without views; keeping it simple here)
  let results = (data ?? []).filter(row => {
    const exam = row.exam as Record<string, unknown> | null;
    if (!exam || !exam.is_active) return false;
    if (status && exam.status !== status) return false;
    if (level  && exam.level  !== level)  return false;
    if (search) {
      const q = search.toLowerCase();
      const name = ((exam.exam_name as string) ?? '').toLowerCase();
      const org  = ((exam.organization as string) ?? '').toLowerCase();
      if (!name.includes(q) && !org.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({ savedExams: results, total: results.length });
}
