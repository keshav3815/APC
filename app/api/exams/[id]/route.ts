import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any;
  const { id } = params;

  const { data, error } = await supabase
    .from('exams')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single();

  if (error) {
    const status = error.code === 'PGRST116' ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ exam: data });
}
