import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateSessionId, toSlug, fromSlug } from '../utils/session'

export type Page = 'welcome' | 'upload-photo' | 'ready' | 'overview'

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [nestName, setNestName] = useState<string | null>(null)
  const [sessionPhotoUrl, setSessionPhotoUrl] = useState<string | null>(null)
  const [page, setPage] = useState<Page>('welcome')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session')
    const view = params.get('view')
    const nest = params.get('nest')
    if (sid) {
      setSessionId(sid)
      if (nest) setNestName(fromSlug(nest))
      if (view === 'overview') setPage('overview')
      supabase.from('sessions').select('photo_url').eq('id', sid).single().then(({ data }) => {
        if (data?.photo_url) setSessionPhotoUrl(data.photo_url)
      })
    }
  }, [])

  function createSession(nest: string) {
    const sid = generateSessionId()
    supabase.from('sessions').insert({ id: sid })
    window.history.pushState({}, '', `?nest=${toSlug(nest)}&session=${sid}`)
    setSessionId(sid)
    setNestName(nest)
    setPage('upload-photo')
  }

  function resetSession() {
    setSessionId(null)
    setNestName(null)
  }

  return { sessionId, nestName, sessionPhotoUrl, setSessionPhotoUrl, page, setPage, createSession, resetSession }
}
