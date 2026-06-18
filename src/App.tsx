import { useState, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import WizardModal from './components/checkout/WizardModal'
import NestBackground from './components/shared/NestBackground'
import OverviewBoard from './components/OverviewBoard'
import UploadPhotoPage from './components/coach/UploadPhotoPage'
import ReadyPage from './components/coach/ReadyPage'
import NowPlaying from './components/shared/NowPlaying'
import { ALL_SONGS, getSessionSongs } from './data/songs'
import { QUESTIONS } from './data/questions'
import { NESTS } from './data/nests'
import { supabase } from './lib/supabase'
import { toSlug } from './utils/session'
import { useSession } from './hooks/useSession'
import { useSubmissions } from './hooks/useSubmissions'
import type { Draft } from './types'
import type { MoodSelection } from './components/checkout/MoodMeter'
import type { FunAnswer } from './components/checkout/FunQuestion'
import type { DrawingStroke } from './components/checkout/Drawing'

const EMPTY_DRAFT: Draft = {
  name: '', emoji: '', mood: null, wins: [], learnings: [], funAnswer: null, weekend: '', drawing: [],
}

function App() {
  const { sessionId, nestName, sessionPhotoUrl, setSessionPhotoUrl, page, setPage, createSession, resetSession } = useSession()
  const { submissions, setSubmissions } = useSubmissions(sessionId)

  const [hoveredNest, setHoveredNest] = useState<string | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [currentSongId, setCurrentSongId] = useState<string | null>(null)
  const [launchRockets, setLaunchRockets] = useState<{ id: number; x: number; y: number; dx: number; dy: number; duration: number; delay: number }[]>([])
  const letsStartRef = useRef<HTMLButtonElement>(null)
  const rocketEmojiRef = useRef<HTMLSpanElement>(null)

  const questionIndex = useMemo(() => Math.floor(Math.random() * QUESTIONS.length), [showWizard]) // eslint-disable-line
  const sessionSongs = useMemo(() => sessionId ? getSessionSongs(sessionId) : ALL_SONGS.slice(0, 3), [sessionId])

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
  function handleSongChange(id: string) {
    setDraft(prev => ({ ...prev, song_choice: id }))
  }

  async function handleNext() {
    if (wizardStep === 0 && draft.song_choice) {
      setCurrentSongId(draft.song_choice)
    }
    const totalSteps = sessionPhotoUrl ? 7 : 6
    if (wizardStep < totalSteps) {
      setWizardStep(s => s + 1)
    } else {
      await supabase.from('sessions').upsert({ id: sessionId })
      const { error } = await supabase.from('submissions').insert({ session_id: sessionId, data: draft })
      if (!error) {
        setSubmissions(prev => [...prev, { ...draft, colorIdx: prev.length }])
        localStorage.setItem('nest-user-name', draft.name)
        localStorage.setItem('nest-user-emoji', draft.emoji)
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

  function handleRestart() {
    window.history.pushState({}, '', `?nest=${toSlug(nestName ?? '')}&session=${sessionId}`)
    setPage('welcome')
  }

  const nestEmoji = NESTS.find(n => n.name === nestName)?.emoji ?? '🥨'
  const allEmojis = NESTS.map(n => n.emoji)
  const backgroundEmojis = sessionId
    ? [nestEmoji]
    : hoveredNest
      ? [NESTS.find(n => n.name === hoveredNest)!.emoji]
      : allEmojis

  const wizardModal = showWizard && (
    <WizardModal
      step={wizardStep}
      draft={draft}
      questionIndex={questionIndex}
      photoUrl={sessionPhotoUrl}
      songs={sessionSongs}
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
            if (step === 0) { resetSession(); setPage('welcome') }
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
            if (step === 0) { resetSession(); setPage('welcome') }
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
            nestEmoji={nestEmoji}
            onAddPerson={startWizard}
            onRestart={handleRestart}
          />
          {wizardModal}
        </>
      )}

      {page === 'welcome' && sessionId && (
        <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-6 sm:px-8">
          <NestBackground emojis={backgroundEmojis} />
          <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
            {nestEmoji.startsWith('/') ? <img src={nestEmoji} className="inline-block w-5 h-5 object-contain align-middle mr-1" /> : nestEmoji} {nestName ?? 'Nest Checkout'}
          </p>
          <h1 className="font-black text-4xl sm:text-6xl text-nl-black text-center leading-tight mb-6">
            Welcome to the<br />Nest Checkout!
          </h1>
          <p className="font-normal text-base sm:text-lg text-nl-black/70 text-center max-w-lg mb-10 sm:mb-12">
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
        <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-6 sm:px-8 py-12">
          <NestBackground emojis={backgroundEmojis} />
          <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
            Nest Checkout
          </p>
          <h1 className="font-black text-4xl sm:text-6xl text-nl-black text-center leading-tight mb-4">
            Hey Coach! 👋
          </h1>
          <p className="font-normal text-base sm:text-lg text-nl-black/70 text-center max-w-lg mb-10 sm:mb-14">
            Time for the weekly Nest Checkout — pick your Nest below<br className="hidden sm:block" />to kick things off and share the link with your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto max-w-sm sm:max-w-none">
            {NESTS.map(nest => (
              <motion.button
                key={nest.name}
                onClick={() => createSession(nest.name)}
                onMouseEnter={() => setHoveredNest(nest.name)}
                onMouseLeave={() => setHoveredNest(null)}
                className="group relative flex flex-row sm:flex-col items-center gap-4 sm:gap-3 sm:w-52 px-5 sm:px-6 py-4 sm:pt-8 sm:pb-6 rounded-2xl sm:rounded-3xl border-2 border-nl-black/10 bg-nl-white hover:border-nl-purple hover:shadow-lg cursor-pointer transition-colors duration-200 text-left"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ willChange: 'transform' }}
              >
                {nest.emoji.startsWith('/')
                  ? <img src={nest.emoji} className="w-12 h-12 sm:w-16 sm:h-16 object-contain shrink-0" />
                  : <span className="text-5xl sm:text-6xl leading-none shrink-0">{nest.emoji}</span>
                }
                <div className="flex flex-col gap-0.5 sm:items-center flex-1 sm:flex-none">
                  <span className="font-black text-base text-nl-black sm:text-center">{nest.name}</span>
                  <span className="text-xs text-nl-black/40 sm:hidden">{nest.tagline}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest transition-colors text-nl-black/20 group-hover:text-nl-purple hidden sm:block">
                  Create session →
                </div>
                <div className="ml-auto sm:hidden text-nl-black/20 group-hover:text-nl-purple text-sm font-bold transition-colors">
                  →
                </div>
              </motion.button>
            ))}
          </div>
          {wizardModal}
        </div>
      )}

      {currentSongId && <NowPlaying songs={sessionSongs} initialSongId={currentSongId} />}
    </>
  )
}

export default App
