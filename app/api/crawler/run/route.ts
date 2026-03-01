import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/crawler/run
 * 
 * Automated exam status updater — triggered by Vercel cron every 6 hours.
 * Also callable manually from the admin dashboard.
 * 
 * What it does:
 * 1. Calls the DB function update_exam_statuses() to auto-close expired exams
 *    and auto-open ones entering their application window
 * 2. Logs the run to crawler_runs table
 * 
 * Protected by CRON_SECRET header or admin session.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Vercel Pro: 60s timeout

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Auth: check CRON_SECRET or admin session
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  const isAuthorizedCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any;

  if (!isAuthorizedCron) {
    // Check if caller is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }
  }

  // Determine run type
  const body = await request.json().catch(() => ({}));
  const runType = isAuthorizedCron ? 'scheduled' : (body.runType || 'manual');

  // Create crawler_run record
  const { data: run, error: runError } = await supabase
    .from('crawler_runs')
    .insert({
      run_type: runType,
      status: 'running',
      scrapers_run: ['status-updater'],
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  const runId = run?.id;

  try {
    // 1. Auto-update exam statuses via DB function
    const { data: statusResult, error: statusError } = await supabase
      .rpc('update_exam_statuses');

    if (statusError) {
      throw new Error(`Status update failed: ${statusError.message}`);
    }

    const result = statusResult?.[0] || statusResult || { closed_count: 0, opened_count: 0, coming_soon_count: 0 };

    // 2. Get total exam counts for the log
    const { count: totalExams } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);

    const { count: openExams } = await supabase
      .from('exams')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('status', 'Open');

    const duration = Date.now() - startTime;

    // 3. Update the crawler_run record
    if (runId) {
      await supabase
        .from('crawler_runs')
        .update({
          status: 'success',
          exams_found: totalExams || 0,
          exams_closed: result.closed_count || 0,
          exams_updated: (result.opened_count || 0) + (result.coming_soon_count || 0),
          errors: 0,
          duration_ms: duration,
          finished_at: new Date().toISOString(),
          metadata: {
            status_changes: {
              closed: result.closed_count,
              opened: result.opened_count,
              coming_soon: result.coming_soon_count,
            },
            total_active: totalExams,
            total_open: openExams,
          },
        })
        .eq('id', runId);
    }

    return NextResponse.json({
      success: true,
      run_id: runId,
      duration_ms: duration,
      status_changes: {
        closed: result.closed_count || 0,
        opened: result.opened_count || 0,
        coming_soon: result.coming_soon_count || 0,
      },
      totals: {
        active_exams: totalExams,
        open_exams: openExams,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    // Update crawler_run as failed
    if (runId) {
      await supabase
        .from('crawler_runs')
        .update({
          status: 'failed',
          errors: 1,
          error_log: error.message || 'Unknown error',
          duration_ms: duration,
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);
    }

    console.error('[Crawler Run] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Crawler run failed', run_id: runId },
      { status: 500 }
    );
  }
}

// GET handler for Vercel cron (cron jobs use GET requests)
export async function GET(request: NextRequest) {
  // Vercel cron sends GET — proxy to POST handler
  const cronSecret = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Forward to POST logic by calling the same endpoint internally
  const response = await POST(
    new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
    })
  );

  return response;
}
