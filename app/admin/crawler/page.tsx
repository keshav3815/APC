'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  Bot,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Activity,
  TrendingUp,
  Database,
  Zap,
  BarChart3,
  Globe,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

interface CrawlerRun {
  id: string
  run_type: string
  status: string
  scrapers_run: string[]
  exams_found: number
  exams_new: number
  exams_updated: number
  exams_closed: number
  errors: number
  error_log: string | null
  duration_ms: number | null
  started_at: string
  finished_at: string | null
  metadata: any
}

interface CrawlerStats {
  total_active: number
  open: number
  closed: number
  coming_soon: number
  by_organization: Record<string, number>
  by_level: Record<string, number>
}

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  partial: AlertTriangle,
  failed: XCircle,
  running: Loader2,
}

const STATUS_COLOR: Record<string, string> = {
  success: 'text-green-500',
  partial: 'text-yellow-500',
  failed: 'text-red-500',
  running: 'text-blue-500 animate-spin',
}

const STATUS_BG: Record<string, string> = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  partial: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  failed: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  running: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
}

export default function AdminCrawlerPage() {
  const supabase = createClient()
  const [runs, setRuns] = useState<CrawlerRun[]>([])
  const [stats, setStats] = useState<CrawlerStats | null>(null)
  const [lastRun, setLastRun] = useState<CrawlerRun | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/crawler/status')
      if (!res.ok) throw new Error('Failed to fetch crawler status')
      const data = await res.json()
      setRuns(data.runs || [])
      setStats(data.stats || null)
      setLastRun(data.last_run || null)
    } catch (err) {
      console.error('Error fetching crawler status:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()

    // Subscribe to real-time updates on crawler_runs
    const channel = supabase
      .channel('crawler-runs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crawler_runs' },
        () => { fetchStatus() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleTriggerRun = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/crawler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ runType: 'manual' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Trigger failed')

      toast.success(
        `Crawler run complete! Closed: ${data.status_changes?.closed || 0}, Opened: ${data.status_changes?.opened || 0}`
      )
      fetchStatus()
    } catch (err: any) {
      toast.error(err.message || 'Failed to trigger crawler run')
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bot className="w-7 h-7 text-orange-500" />
            Exam Crawler Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Automated exam data fetching, status updates &amp; monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleTriggerRun}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {triggering ? 'Running…' : 'Run Status Update'}
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Exams" value={stats.total_active} icon={Database} color="blue" />
          <StatCard label="Open Now" value={stats.open} icon={Zap} color="green" />
          <StatCard label="Closed" value={stats.closed} icon={XCircle} color="red" />
          <StatCard label="Coming Soon" value={stats.coming_soon} icon={Clock} color="yellow" />
        </div>
      )}

      {/* Last Run Summary */}
      {lastRun && (
        <div className={`rounded-xl border p-5 ${STATUS_BG[lastRun.status] || 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {(() => {
                  const Icon = STATUS_ICON[lastRun.status] || Activity
                  return <Icon className={`w-5 h-5 ${STATUS_COLOR[lastRun.status] || 'text-gray-500'}`} />
                })()}
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Last Run: {lastRun.status.charAt(0).toUpperCase() + lastRun.status.slice(1)}
                </h3>
                <span className="text-xs bg-white dark:bg-gray-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300 border">
                  {lastRun.run_type}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDistanceToNow(new Date(lastRun.started_at), { addSuffix: true })}
                {lastRun.duration_ms && ` · ${(lastRun.duration_ms / 1000).toFixed(1)}s`}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-white">{lastRun.exams_found}</div>
                <div className="text-gray-500 text-xs">Found</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600">{lastRun.exams_new}</div>
                <div className="text-gray-500 text-xs">New</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-blue-600">{lastRun.exams_updated}</div>
                <div className="text-gray-500 text-xs">Updated</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-red-600">{lastRun.exams_closed}</div>
                <div className="text-gray-500 text-xs">Closed</div>
              </div>
              {lastRun.errors > 0 && (
                <div className="text-center">
                  <div className="font-bold text-red-500">{lastRun.errors}</div>
                  <div className="text-gray-500 text-xs">Errors</div>
                </div>
              )}
            </div>
          </div>
          {lastRun.scrapers_run?.length > 0 && (
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {lastRun.scrapers_run.map(s => (
                <span key={s} className="bg-white dark:bg-gray-700 text-xs px-2 py-1 rounded-md border text-gray-600 dark:text-gray-300">
                  {s}
                </span>
              ))}
            </div>
          )}
          {lastRun.error_log && (
            <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-300 text-xs font-mono whitespace-pre-wrap">
              {lastRun.error_log}
            </div>
          )}
        </div>
      )}

      {/* Organization Breakdown */}
      {stats && Object.keys(stats.by_organization).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-orange-500" />
            Exams by Organization
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(stats.by_organization)
              .sort((a, b) => b[1] - a[1])
              .map(([org, count]) => (
                <div key={org} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate mr-2">{org}</span>
                  <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Level Breakdown */}
      {stats && Object.keys(stats.by_level).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Exams by Level
          </h3>
          <div className="flex gap-4">
            {Object.entries(stats.by_level).map(([level, count]) => (
              <div key={level} className="flex-1 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{level}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Run History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            Run History
          </h3>
        </div>
        {runs.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-medium">No crawler runs yet</p>
            <p className="text-sm">Click &quot;Run Status Update&quot; to trigger the first run.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {runs.map(run => {
              const Icon = STATUS_ICON[run.status] || Activity
              return (
                <div key={run.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 flex-shrink-0 ${STATUS_COLOR[run.status] || 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            {run.run_type}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {format(new Date(run.started_at), 'MMM d, yyyy h:mm a')}
                          {run.duration_ms && ` · ${(run.duration_ms / 1000).toFixed(1)}s`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-shrink-0">
                      {run.exams_new > 0 && (
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="w-3 h-3" />
                          {run.exams_new} new
                        </span>
                      )}
                      {run.exams_updated > 0 && (
                        <span className="text-blue-600">{run.exams_updated} updated</span>
                      )}
                      {run.exams_closed > 0 && (
                        <span className="text-red-600">{run.exams_closed} closed</span>
                      )}
                      {run.errors > 0 && (
                        <span className="text-red-500">{run.errors} err</span>
                      )}
                      {run.scrapers_run?.length > 0 && (
                        <span className="text-gray-400">{run.scrapers_run.join(', ')}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Python Crawler Integration Info */}
      <div className="bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🐍 Python Crawler Integration</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          The full exam crawler (UPSC, SSC, IBPS, BPSC, UPPSC, MPPSC) runs as a scheduled Python process and pushes
          results to this dashboard via webhook. The &quot;Run Status Update&quot; button above runs the lightweight
          status updater that auto-closes expired exams and opens new ones.
        </p>
        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 font-mono text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
          <div className="text-gray-400 dark:text-gray-500"># Run the full crawler manually:</div>
          <div className="text-orange-600 dark:text-orange-400">cd crawler &amp;&amp; python main.py --notify</div>
          <div className="mt-2 text-gray-400 dark:text-gray-500"># Or with specific scrapers:</div>
          <div className="text-orange-600 dark:text-orange-400">python main.py --scrapers upsc,ssc,bpsc --notify</div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: number
  icon: typeof Database
  color: 'blue' | 'green' | 'red' | 'yellow'
}) {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        </div>
      </div>
    </div>
  )
}
