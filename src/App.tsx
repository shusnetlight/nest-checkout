import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WizardModal from './components/checkout/WizardModal'
import NestBackground from './components/NestBackground'
import OverviewBoard, { type Submission } from './components/OverviewBoard'
import UploadPhotoPage from './components/coach/UploadPhotoPage'
import ReadyPage from './components/coach/ReadyPage'
import NowPlaying from './components/NowPlaying'
import { ALL_SONGS, getSessionSongs } from './lib/songs'
import { QUESTIONS } from './data/questions'
import { supabase } from './lib/supabase'
import type { MoodSelection } from './components/checkout/MoodMeter'
import type { FunAnswer } from './components/checkout/FunQuestion'
import type { DrawingStroke } from './components/checkout/Drawing'

export interface Draft {
  name: string
  emoji: string
  mood: MoodSelection | null
  wins: string[]
  learnings: string[]
  funAnswer: FunAnswer | null
  weekend: string
  drawing: DrawingStroke[]
  song_choice?: string
}

const EMPTY_DRAFT: Draft = {
  name: '', emoji: '', mood: null, wins: [], learnings: [], funAnswer: null, weekend: '', drawing: [],
}

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10)
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-')
}

const NESTS = [
  { name: 'Pretzel Gaudi',      emoji: '🥨', tagline: 'Crispy, twisted & always there' },
  { name: 'Travelling Racoons', emoji: '/racoon.png', tagline: 'Curious minds, always exploring' },
  { name: 'Diamond Ducks',      emoji: '/diamond-duck.png', tagline: 'Waddling strong, shining bright' },
]

function fromSlug(slug: string) {
  return NESTS.find(n => toSlug(n.name) === slug)?.name ?? slug
}

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [nestName, setNestName] = useState<string | null>(null)
  const [hoveredNest, setHoveredNest] = useState<string | null>(null)
  const [sessionPhotoUrl, setSessionPhotoUrl] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [page, setPage] = useState<'welcome' | 'upload-photo' | 'ready' | 'overview'>('welcome')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const letsStartRef = useRef<HTMLButtonElement>(null)
  const rocketEmojiRef = useRef<HTMLSpanElement>(null)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const [launchRockets, setLaunchRockets] = useState<{ id: number; x: number; y: number; dx: number; dy: number; duration: number; delay: number }[]>([])

  const questionIndex = useMemo(() => Math.floor(Math.random() * QUESTIONS.length), [showWizard]) // eslint-disable-line

  const [songVoteCounts, setSongVoteCounts] = useState<Record<string, number>>({})
  const [songStartedAt, setSongStartedAt] = useState<number | null>(null)

  const sessionSongs = useMemo(() => sessionId ? getSessionSongs(sessionId) : ALL_SONGS.slice(0, 3), [sessionId])

  const winningSong = useMemo(() => {
    const entries = Object.entries(songVoteCounts).sort((a, b) => b[1] - a[1])
    if (!entries.length) return null
    return sessionSongs.find(s => s.id === entries[0][0]) ?? null
  }, [songVoteCounts, sessionSongs])


  function handleLetsStart() {
    const origin = rocketEmojiRef.current ?? letsStartRef.current
    if (origin) {
      const rect = origin.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const spread = [
        { dx: 160, dy: -420, duration: 0.8, delay: 0.00 },
        { dx: 220, dy: -380, duration: 0.9, delay: 0.07 },
        { dx: 130, dy: -460, duration: 0.75, delay: 0.12 },
        { dx: 280, dy: -340, duration: 1.0, delay: 0.04 },
        { dx: 190, dy: -490, duration: 0.85, delay: 0.16 },
        { dx: 100, dy: -400, duration: 0.7, delay: 0.09 },
        { dx: 250, dy: -440, duration: 0.95, delay: 0.02 },
      ]
      setLaunchRockets(spread.map((s, i) => ({ id: Date.now() + i, x: cx, y: cy, ...s })))
      setTimeout(() => setLaunchRockets([]), 1200)
    }
    setTimeout(() => {
      setDraft(EMPTY_DRAFT)
      setWizardStep(0)
      setShowWizard(true)
    }, 500)
  }

  const loadAndSubscribe = useCallback(async (sid: string) => {
    const { data } = await supabase
      .from('submissions')
      .select('data')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })

    if (data) {
      setSubmissions(data.map((row, i) => ({ ...row.data, colorIdx: i })))
      const counts: Record<string, number> = {}
      for (const row of data) {
        const choice = row.data?.song_choice
        if (choice) counts[choice] = (counts[choice] ?? 0) + 1
      }
      setSongVoteCounts(counts)
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
      .on('broadcast', { event: 'song_vote' }, (payload) => {
        const { songId, startedAt } = payload.payload ?? {}
        if (songId) setSongVoteCounts(prev => ({ ...prev, [songId]: (prev[songId] ?? 0) + 1 }))
        if (typeof startedAt === 'number') setSongStartedAt(startedAt)
      })
      .subscribe()
    channelRef.current = channel
  }, [])

  // On mount: check URL for session, nest and view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session')
    const view = params.get('view')
    const nest = params.get('nest')
    if (sid) {
      setSessionId(sid)
      if (nest) setNestName(fromSlug(nest))
      loadAndSubscribe(sid)
      if (view === 'overview') setPage('overview')
      supabase.from('sessions').select('photo_url, song_started_at').eq('id', sid).single().then(({ data }) => {
        if (data?.photo_url) setSessionPhotoUrl(data.photo_url)
        if (typeof data?.song_started_at === 'number') setSongStartedAt(data.song_started_at)
      })
    }
  }, [loadAndSubscribe])

  function createSession(nest: string) {
    const sid = generateSessionId()
    supabase.from('sessions').insert({ id: sid })
    window.history.pushState({}, '', `?nest=${toSlug(nest)}&session=${sid}`)
    setSessionId(sid)
    setNestName(nest)
    loadAndSubscribe(sid)
    setPage('upload-photo')
  }

  function handleDraftChange(field: 'name' | 'emoji', value: string) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }
  function handleMoodChange(mood: MoodSelection) {
    setDraft(prev => ({ ...prev, mood }))
  }
  function handleAchievementsChange(field: 'wins' | 'learnings', items: string[]) {
    setDraft(prev => ({ ...prev, [field]: items }))
  }
  function handleFunAnswerChange(funAnswer: FunAnswer) {
    setDraft(prev => ({ ...prev, funAnswer }))
  }
  function handleWeekendChange(weekend: string) {
    setDraft(prev => ({ ...prev, weekend }))
  }
  function handleDrawingChange(drawing: DrawingStroke[]) {
    setDraft(prev => ({ ...prev, drawing }))
  }

  async function handleNext() {
    if (wizardStep === 0 && draft.song_choice) {
      const songId = draft.song_choice
      const newCounts = { ...songVoteCounts, [songId]: (songVoteCounts[songId] ?? 0) + 1 }
      const newWinnerId = Object.entries(newCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      const oldWinnerId = Object.entries(songVoteCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
      const winnerChanged = newWinnerId !== oldWinnerId
      const now = winnerChanged ? Date.now() : null
      channelRef.current?.send({
        type: 'broadcast',
        event: 'song_vote',
        payload: { songId, ...(now !== null ? { startedAt: now } : {}) },
      })
      if (now !== null) {
        supabase.from('sessions').upsert({ id: sessionId, song_started_at: now })
      }
      setSongVoteCounts(newCounts)
      if (now !== null) setSongStartedAt(now)
    }
    const totalSteps = sessionPhotoUrl ? 7 : 6
    if (wizardStep < totalSteps) {
      setWizardStep(s => s + 1)
    } else {
      await supabase.from('sessions').upsert({ id: sessionId })
      const { error } = await supabase.from('submissions').insert({ session_id: sessionId, data: draft })
      if (!error) {
        setSubmissions(prev => [...prev, { ...draft, colorIdx: prev.length }])
      }
      setShowWizard(false)
      setDraft(EMPTY_DRAFT)
      window.history.pushState({}, '', `?nest=${toSlug(nestName ?? '')}&session=${sessionId}&view=overview`)
      setPage('overview')
    }
  }

  function handleBack() {
    if (wizardStep === 0) setShowWizard(false)
    else setWizardStep(s => s - 1)
  }

  function startWizard() {
    setDraft(EMPTY_DRAFT)
    setWizardStep(0)
    setShowWizard(true)
  }

  function handleSongChange(id: string) {
    setDraft(prev => ({ ...prev, song_choice: id }))
  }

  function handleRestart() {
    window.history.pushState({}, '', `?nest=${toSlug(nestName ?? '')}&session=${sessionId}`)
    setPage('welcome')
  }

  const wizardModal = showWizard && (
    <WizardModal
      step={wizardStep}
      draft={draft}
      questionIndex={questionIndex}
      photoUrl={sessionPhotoUrl}
      songs={sessionSongs}
      songVotes={songVoteCounts}
      onSongChange={handleSongChange}
      onDraftChange={handleDraftChange}
      onMoodChange={handleMoodChange}
      onAchievementsChange={handleAchievementsChange}
      onFunAnswerChange={handleFunAnswerChange}
      onWeekendChange={handleWeekendChange}
      onDrawingChange={handleDrawingChange}
      onNext={handleNext}
      onBack={handleBack}
      onClose={() => setShowWizard(false)}
    />
  )

  const nestEmoji = NESTS.find(n => n.name === nestName)?.emoji ?? '🥨'
  const allEmojis = NESTS.map(n => n.emoji)
  const backgroundEmojis = sessionId
    ? [nestEmoji]
    : hoveredNest
      ? [NESTS.find(n => n.name === hoveredNest)!.emoji]
      : allEmojis

  return (
    <>
      {page === 'upload-photo' && (
        <UploadPhotoPage
          sessionId={sessionId!}
          nestName={nestName ?? ''}
          nestEmoji={nestEmoji}
          onDone={(url) => {
            if (url) setSessionPhotoUrl(url)
            setPage('ready')
          }}
          onNavigate={(step) => {
            if (step === 0) { setSessionId(null); setNestName(null); setPage('welcome') }
          }}
        />
      )}

      {page === 'ready' && (
        <ReadyPage
          sessionId={sessionId!}
          nestName={nestName ?? ''}
          nestEmoji={nestEmoji}
          onStart={() => setPage('welcome')}
          onNavigate={(step) => {
            if (step === 0) { setSessionId(null); setNestName(null); setPage('welcome') }
            if (step === 1) setPage('upload-photo')
          }}
        />
      )}

      {page === 'overview' && (
        <>
          <OverviewBoard
            submissions={submissions}
            sessionId={sessionId!}
            nestName={nestName ?? ''}
            onAddPerson={startWizard}
            onRestart={handleRestart}
          />
          {wizardModal}
        </>
      )}

      {page === 'welcome' && sessionId && (
        <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
          <NestBackground emojis={backgroundEmojis} />
          <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
            {nestEmoji.startsWith('/') ? <img src={nestEmoji} className="inline-block w-5 h-5 object-contain align-middle mr-1" /> : nestEmoji} {nestName ?? 'Nest Checkout'}
          </p>
          <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-6">
            Welcome to the<br />Nest Checkout!
          </h1>
          <p className="font-normal text-lg text-nl-black/70 text-center max-w-lg mb-12">
            A weekly space to reflect, celebrate wins, and connect.<br />Ready to check in?
          </p>
          <button
            ref={letsStartRef}
            onClick={handleLetsStart}
            className="relative z-10 bg-nl-purple-dark text-nl-white font-bold text-base px-10 py-4 rounded-xl hover:bg-nl-purple hover:text-nl-black transition-colors cursor-pointer"
          >
            Let's Start <span ref={rocketEmojiRef}>🚀</span>
          </button>
          <div className="flex gap-3 mt-25">
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href) }}
              className="relative z-10 text-xs font-semibold text-nl-black/30 hover:text-nl-black/60 border border-nl-black/15 hover:border-nl-black/30 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              🔗 Share link
            </button>
            <button
              onClick={() => { window.history.pushState({}, '', `?nest=${toSlug(nestName ?? '')}&session=${sessionId}&view=overview`); setPage('overview') }}
              className="relative z-10 text-xs font-semibold text-nl-black/30 hover:text-nl-black/60 border border-nl-black/15 hover:border-nl-black/30 px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Overview →
            </button>
          </div>
          {wizardModal}
          {createPortal(
            <AnimatePresence>
              {launchRockets.map(r => (
                <motion.div
                  key={r.id}
                  className="fixed pointer-events-none text-2xl z-[999] -translate-x-1/2 -translate-y-1/2"
                  style={{ left: r.x, top: r.y }}
                  initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
                  animate={{ y: r.dy, x: r.dx, opacity: 0, rotate: 0 }}
                  transition={{ duration: r.duration, ease: [0.2, 0, 0.3, 1], delay: r.delay }}
                >
                  🚀
                </motion.div>
              ))}
            </AnimatePresence>,
            document.body
          )}
        </div>
      )}

      {page === 'welcome' && !sessionId && (
        <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
          <NestBackground emojis={backgroundEmojis} />
          <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
            Nest Checkout
          </p>
          <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-4">
            Hey Coach! 👋
          </h1>
          <p className="font-normal text-lg text-nl-black/70 text-center max-w-lg mb-14">
            Time for the weekly Nest Checkout — pick your Nest below<br />to kick things off and share the link with your team.
          </p>
          <div className="flex gap-5">
            {NESTS.map(nest => (
              <motion.button
                key={nest.name}
                onClick={() => createSession(nest.name)}
                onMouseEnter={() => setHoveredNest(nest.name)}
                onMouseLeave={() => setHoveredNest(null)}
                className="group relative flex flex-col items-center gap-3 w-52 px-6 pt-8 pb-6 rounded-3xl border-2 border-nl-black/10 bg-nl-white hover:border-nl-purple hover:shadow-lg cursor-pointer transition-colors duration-200 text-left"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ willChange: 'transform' }}
              >
                {nest.emoji.startsWith('/')
                  ? <img src={nest.emoji} className="w-16 h-16 object-contain" />
                  : <span className="text-6xl leading-none">{nest.emoji}</span>
                }
                <span className="font-black text-base text-nl-black text-center">{nest.name}</span>
                <div className="text-xs font-bold uppercase tracking-widest transition-colors text-nl-black/20 group-hover:text-nl-purple">
                  Create session →
                </div>
              </motion.button>
            ))}
          </div>
          {wizardModal}
        </div>
      )}

      {winningSong && <NowPlaying song={winningSong} startedAt={songStartedAt} />}
    </>
  )
}

export default App
