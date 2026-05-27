import { useState, useMemo, useEffect, useCallback } from 'react'
import WizardModal from './components/WizardModal'
import PretzelBackground from './components/PretzelBackground'
import OverviewBoard, { type Submission } from './components/OverviewBoard'
import { supabase } from './lib/supabase'
import type { MoodSelection } from './components/steps/StepMoodMeter'
import type { FunAnswer } from './components/steps/StepFunQuestion'

export interface Draft {
  name: string
  emoji: string
  mood: MoodSelection | null
  wins: string[]
  learnings: string[]
  funAnswer: FunAnswer | null
  weekend: string
}

const EMPTY_DRAFT: Draft = {
  name: '', emoji: '', mood: null, wins: [], learnings: [], funAnswer: null, weekend: '',
}

function generateSessionId() {
  return Math.random().toString(36).slice(2, 10)
}

const NESTS = [
  { name: 'Pretzel Gaudi',       emoji: '🥨' },
  { name: 'Travelling Racoons',  emoji: '🦝' },
  { name: 'Diamond Ducks',       emoji: '🦆' },
]

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [nestName, setNestName] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [page, setPage] = useState<'welcome' | 'overview'>('welcome')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const questionIndex = useMemo(() => Math.floor(Math.random() * 15), [showWizard]) // eslint-disable-line

  const loadAndSubscribe = useCallback(async (sid: string) => {
    const { data } = await supabase
      .from('submissions')
      .select('data')
      .eq('session_id', sid)
      .order('created_at', { ascending: true })

    if (data) {
      setSubmissions(data.map((row, i) => ({ ...row.data, colorIdx: i })))
    }

    supabase
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
  }, [])

  // On mount: check URL for session, nest and view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sid = params.get('session')
    const view = params.get('view')
    const nest = params.get('nest')
    if (sid) {
      setSessionId(sid)
      if (nest) setNestName(nest)
      loadAndSubscribe(sid)
      if (view === 'overview') setPage('overview')
    }
  }, [loadAndSubscribe])

  async function createSession(nest: string) {
    const sid = generateSessionId()
    await supabase.from('sessions').insert({ id: sid })
    window.history.pushState({}, '', `?session=${sid}&nest=${encodeURIComponent(nest)}`)
    setSessionId(sid)
    setNestName(nest)
    loadAndSubscribe(sid)
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

  async function handleNext() {
    if (wizardStep < 5) {
      setWizardStep(s => s + 1)
    } else {
      await supabase.from('submissions').insert({ session_id: sessionId, data: draft })
      setShowWizard(false)
      setDraft(EMPTY_DRAFT)
      window.history.pushState({}, '', `?session=${sessionId}&nest=${encodeURIComponent(nestName ?? '')}&view=overview`)
      setPage('overview')
    }
  }

  function handleBack() {
    if (wizardStep === 1) setShowWizard(false)
    else setWizardStep(s => s - 1)
  }

  function startWizard() {
    setDraft(EMPTY_DRAFT)
    setWizardStep(1)
    setShowWizard(true)
  }

  async function handleReset() {
    if (!sessionId) return
    await supabase.from('submissions').delete().eq('session_id', sessionId)
    setSubmissions([])
  }

  const wizardModal = showWizard && (
    <WizardModal
      step={wizardStep}
      draft={draft}
      questionIndex={questionIndex}
      onDraftChange={handleDraftChange}
      onMoodChange={handleMoodChange}
      onAchievementsChange={handleAchievementsChange}
      onFunAnswerChange={handleFunAnswerChange}
      onWeekendChange={handleWeekendChange}
      onNext={handleNext}
      onBack={handleBack}
      onClose={() => setShowWizard(false)}
    />
  )

  // Overview page
  if (page === 'overview') {
    return (
      <>
        <OverviewBoard
          submissions={submissions}
          sessionId={sessionId!}
          nestName={nestName ?? ''}
          onAddPerson={startWizard}
          onReset={handleReset}
        />
        {wizardModal}
      </>
    )
  }

  // Welcome page — joining via shared link
  if (sessionId) {
    return (
      <div className="min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
        <PretzelBackground />
        <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
          {nestName ?? 'Nest Checkout'}
        </p>
        <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-6">
          Welcome to the<br />Nest Checkout!
        </h1>
        <p className="font-normal text-lg text-nl-black/70 text-center max-w-lg mb-12">
          A weekly space to reflect, celebrate wins, and connect.<br />Ready to check in?
        </p>
        <button
          onClick={startWizard}
          className="bg-nl-purple-dark text-nl-white font-bold text-base px-10 py-4 rounded hover:bg-nl-purple hover:text-nl-black transition-colors"
        >
          Let's Start 🚀
        </button>
        {wizardModal}
      </div>
    )
  }

  // Welcome page — Nest Coach starting a new session
  const [selectedNest, setSelectedNest] = [nestName, setNestName]
  return (
    <div className="min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
      <PretzelBackground />

      <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
        Nest Checkout
      </p>

      <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-4">
        Hey Coach! 👋
      </h1>

      <p className="font-normal text-lg text-nl-black/70 text-center max-w-lg mb-12">
        Start your weekly Nest Checkout — a moment to celebrate wins,<br />share how you're feeling, and connect as a team.
      </p>

      <p className="font-semibold text-sm uppercase tracking-widest text-nl-black/40 mb-5">
        Which Nest are you checking in with?
      </p>

      <div className="flex gap-4 mb-10">
        {NESTS.map(nest => (
          <button
            key={nest.name}
            onClick={() => setSelectedNest(nest.name)}
            className={`flex flex-col items-center gap-2 px-8 py-6 rounded-2xl border-2 transition-all
              ${selectedNest === nest.name
                ? 'border-nl-purple bg-nl-purple/10 scale-[1.03] shadow-md'
                : 'border-nl-black/10 bg-nl-white hover:border-nl-purple/40 hover:bg-nl-purple/5'
              }`}
          >
            <span className="text-4xl">{nest.emoji}</span>
            <span className="font-bold text-sm text-nl-black">{nest.name}</span>
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedNest && createSession(selectedNest)}
        disabled={!selectedNest}
        className={`font-bold text-base px-10 py-4 rounded transition-colors
          ${selectedNest
            ? 'bg-nl-purple-dark text-nl-white hover:bg-nl-purple hover:text-nl-black'
            : 'bg-nl-black/10 text-nl-black/30 cursor-not-allowed'
          }`}
      >
        Start session →
      </button>

      {wizardModal}
    </div>
  )
}

export default App
