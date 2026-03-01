import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/crawler/status
 * 
 * Returns latest crawler run info + exam statistics.
 * Used by admin dashboard.
 */

export const dynamic = 'force-dynamic';

export async function GET() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any;

  try {
    // Fetch last 10 crawler runs
    const { data: runs } = await supabase
      .from('crawler_runs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10);

    // Fetch exam stats
    const { count: totalActive } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: openExams } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('status', 'Open');

    const { count: closedExams } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('status', 'Closed');

    const { count: comingSoon } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('status', 'Coming Soon');

    // Get exams by organization
    const { data: orgData } = await supabase
      .from('exams')
      .select('organization')
      .eq('is_active', true);

    const orgCounts: Record<string, number> = {};
    (orgData || []).forEach((e: any) => {
      const org = e.organization || 'Unknown';
      orgCounts[org] = (orgCounts[org] || 0) + 1;
    });

    // Get exams by level
    const { data: levelData } = await supabase
      .from('exams')
      .select('level')
      .eq('is_active', true);

    const levelCounts: Record<string, number> = {};
    (levelData || []).forEach((e: any) => {
      const level = e.level || 'Unknown';
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    return NextResponse.json({
      runs: runs || [],
      stats: {
        total_active: totalActive || 0,
        open: openExams || 0,
        closed: closedExams || 0,
        coming_soon: comingSoon || 0,
        by_organization: orgCounts,
        by_level: levelCounts,
      },
      last_run: runs?.[0] || null,
    });
  } catch (error: any) {
    console.error('[Crawler Status] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch crawler status' },
      { status: 500 }
    );
  }
}
