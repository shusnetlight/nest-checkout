import { useState, useRef, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Submission } from '../types'

export function useSubmissions(sessionId: string | null) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const subscribe = useCallback((sid: string) => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`session-${sid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions', filter: `session_id=eq.${sid}` },
        (payload) => {
          setSubmissions(prev => {
            const exists = prev.some(s => s.name === payload.new.data.name && s.emoji === payload.new.data.emoji)
            if (exists) return prev
            return [...prev, { ...payload.new.data, colorIdx: prev.length }]
          })
        }
      )
      .subscribe()
    channelRef.current = channel

    supabase
      .from('submissions')
      .select('data')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setSubmissions(data.map((row, i) => ({ ...row.data, colorIdx: i })))
      })
  }, [])

  useEffect(() => {
    if (!sessionId) return
    subscribe(sessionId)
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [sessionId, subscribe])

  return { submissions, setSubmissions }
}
