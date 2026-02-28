import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const level    = searchParams.get('level');
  const status   = searchParams.get('status');
  const state    = searchParams.get('state');
  const search   = searchParams.get('search');
  const page     = parseInt(searchParams.get('page') ?? '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') ?? '20', 10);
  const offset   = (page - 1) * pageSize;

  let query = supabase
    .from('exams')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (level)  query = query.eq('level', level);
  if (status) query = query.eq('status', status);
  if (state)  query = query.eq('state', state);
  if (search) {
    query = query.or(
      `exam_name.ilike.%${search}%,organization.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    exams: data,
    total: count,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  });
}
