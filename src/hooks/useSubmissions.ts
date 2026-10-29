import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import type { Draft, Submission } from '../types'

interface Row {
  id: string | number
  created_at: string
  data: Draft
}

const POLL_INTERVAL_MS = 15000

// Merge by row id so neither a late fetch nor a duplicate realtime event can drop entries
function mergeRows(prev: Row[], incoming: Row[]): Row[] {
  const byId = new Map(prev.map(r => [r.id, r]))
  incoming.forEach(r => byId.set(r.id, r))
  return [...byId.values()].sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function useSubmissions(sessionId: string | null) {
  const [rows, setRows] = useState<Row[]>([])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const refresh = useCallback(async () => {
    if (!sessionId) return
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })
    if (error) {
      console.error('Failed to load submissions', error)
      return
    }
    if (data) setRows(prev => mergeRows(prev, data as Row[]))
  }, [sessionId])

  useEffect(() => {
    if (!sessionId) return

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions', filter: `session_id=eq.${sessionId}` },
        (payload) => setRows(prev => mergeRows(prev, [payload.new as Row]))
      )
      .subscribe((status) => {
        // Refetch on every (re)subscribe — realtime does not replay events missed while disconnected.
        // Also on errors, so the board still loads (and polls) when realtime is unavailable.
        if (status !== 'CLOSED') refresh()
      })
    channelRef.current = channel

    const onVisible = () => { if (document.visibilityState === 'visible') refresh() }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('online', refresh)
    window.addEventListener('focus', refresh)
    const poll = setInterval(refresh, POLL_INTERVAL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('online', refresh)
      window.removeEventListener('focus', refresh)
      clearInterval(poll)
      setRows([])
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [sessionId, refresh])

  const submissions = useMemo<Submission[]>(
    () => rows.map((r, i) => ({ ...r.data, colorIdx: i })),
    [rows]
  )

  return { submissions, refresh }
}
