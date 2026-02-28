import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/save-exam
 * Body: { exam_id: string }
 * Toggles saved state — inserts if not saved, deletes if already saved.
 * Returns: { saved: boolean }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  }

  let body: { exam_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { exam_id } = body;
  if (!exam_id) {
    return NextResponse.json({ error: 'exam_id is required' }, { status: 400 });
  }

  // Check existing
  const { data: existing } = await supabase
    .from('saved_exams')
    .select('id')
    .eq('student_id', user.id)
    .eq('exam_id', exam_id)
    .maybeSingle();

  if (existing) {
    // Unsave
    const { error } = await supabase
      .from('saved_exams')
      .delete()
      .eq('id', existing.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ saved: false });
  } else {
    // Save
    const { error } = await supabase
      .from('saved_exams')
      .insert({ student_id: user.id, exam_id });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ saved: true });
  }
}
