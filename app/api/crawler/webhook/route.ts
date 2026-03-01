import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/crawler/webhook
 * 
 * Webhook endpoint for the Python crawler to push results after each run.
 * Protected by CRON_SECRET (shared secret between crawler and API).
 * 
 * Expected payload:
 * {
 *   "scrapers": ["UPSC", "SSC", "BPSC"],
 *   "exams": [{ ...exam data matching DB schema }],
 *   "stats": { "scraped": 10, "new": 3, "updated": 5, "errors": 2 },
 *   "error_log": "optional error details"
 * }
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // Authenticate via shared secret
  const authHeader = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!authHeader || authHeader !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { scrapers = [], exams = [], stats = {}, error_log = '' } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServerSupabaseClient() as any;

  // Create crawler_run record
  const { data: run } = await supabase
    .from('crawler_runs')
    .insert({
      run_type: 'webhook',
      status: 'running',
      scrapers_run: scrapers,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  const runId = run?.id;

  try {
    let newCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Upsert each exam
    for (const exam of exams) {
      if (!exam.exam_name || !exam.organization) {
        errors.push(`Skipped exam with missing name/org: ${JSON.stringify(exam).slice(0, 100)}`);
        errorCount++;
        continue;
      }

      // Check if exam exists (by name + org)
      const { data: existing } = await supabase
        .from('exams')
        .select('id')
        .ilike('exam_name', exam.exam_name)
        .ilike('organization', exam.organization)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('exams')
          .update({
            ...exam,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) {
          errors.push(`Update failed for "${exam.exam_name}": ${error.message}`);
          errorCount++;
        } else {
          updatedCount++;
        }
      } else {
        // Insert new
        const { error } = await supabase
          .from('exams')
          .insert({
            ...exam,
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (error) {
          errors.push(`Insert failed for "${exam.exam_name}": ${error.message}`);
          errorCount++;
        } else {
          newCount++;
        }
      }
    }

    // Also auto-update statuses
    const { data: statusResult } = await supabase.rpc('update_exam_statuses');
    const statusChanges = statusResult?.[0] || statusResult || {};

    const duration = Date.now() - startTime;

    // Update crawler_run record
    if (runId) {
      await supabase
        .from('crawler_runs')
        .update({
          status: errorCount > 0 ? 'partial' : 'success',
          exams_found: exams.length,
          exams_new: newCount,
          exams_updated: updatedCount,
          exams_closed: statusChanges.closed_count || 0,
          errors: errorCount,
          error_log: errors.length > 0 ? errors.join('\n') : (error_log || null),
          duration_ms: duration,
          finished_at: new Date().toISOString(),
          metadata: {
            crawler_stats: stats,
            status_changes: statusChanges,
            scrapers,
          },
        })
        .eq('id', runId);
    }

    return NextResponse.json({
      success: true,
      run_id: runId,
      duration_ms: duration,
      new: newCount,
      updated: updatedCount,
      errors: errorCount,
      status_changes: statusChanges,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    if (runId) {
      await supabase
        .from('crawler_runs')
        .update({
          status: 'failed',
          errors: 1,
          error_log: error.message || 'Webhook processing failed',
          duration_ms: duration,
          finished_at: new Date().toISOString(),
        })
        .eq('id', runId);
    }

    console.error('[Crawler Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed', run_id: runId },
      { status: 500 }
    );
  }
}
