import { useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import Identity from './Identity'
import MoodMeter, { type MoodSelection } from './MoodMeter'
import Achievements, { type AchievementsRef } from './Achievements'
import FunQuestion, { type FunAnswer } from './FunQuestion'
import Weekend from './Weekend'
import WeekRecap from './WeekRecap'
import Drawing, { type DrawingStroke } from './Drawing'
import SongPicker from '../SongPicker'
import type { Song } from '../../lib/songs'

const STEPS_BASE    = ['Your Identity', 'Mood Check', 'Achievements', 'Fun Question', 'Weekend Plans', "Let's Co-Create"]
const STEPS_PHOTO   = ['Your Identity', 'Mood Check', 'Week Recap', 'Achievements', 'Fun Question', 'Weekend Plans', "Let's Co-Create"]

interface Draft {
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

interface Props {
  step: number
  draft: Draft
  questionIndex: number
  photoUrl: string | null
  songs: Song[]
  onSongChange: (id: string) => void
  onDraftChange: (field: 'name' | 'emoji', value: string) => void
  onMoodChange: (mood: MoodSelection) => void
  onAchievementsChange: (field: 'wins' | 'learnings', items: string[]) => void
  onFunAnswerChange: (a: FunAnswer) => void
  onWeekendChange: (v: string) => void
  onDrawingChange: (strokes: DrawingStroke[]) => void
  onNext: () => void
  onBack: () => void
  onClose: () => void
}

export default function WizardModal({ step, draft, questionIndex, photoUrl, songs, onSongChange, onDraftChange, onMoodChange, onAchievementsChange, onFunAnswerChange, onWeekendChange, onDrawingChange, onNext, onBack, onClose }: Props) {
  const STEPS = photoUrl ? STEPS_PHOTO : STEPS_BASE
  const submitRef = useRef<HTMLButtonElement>(null)
  const achievementsRef = useRef<AchievementsRef>(null)
  const [achievementsPending, setAchievementsPending] = useState({ wins: false, learnings: false })

  function handleNext() {
    achievementsRef.current?.flush()
    if (step === STEPS.length && submitRef.current) {
      const rect = submitRef.current.getBoundingClientRect()
      confetti({
        particleCount: 120,
        spread: 80,
        origin: {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        },
      })
    }
    onNext()
  }

  // ── Step 0: Song picker (no progress bar) ─────────────────────────────────
  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-nl-beige/90 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
        <div className="bg-nl-white flex flex-col shadow-xl rounded-2xl overflow-hidden animate-fade-up w-full max-w-lg">

          <div className="flex items-center justify-between px-8 pt-6 pb-2">
            <div>
              <h2 className="font-black text-2xl text-nl-black">Pick your background music</h2>
              <p className="font-semibold text-sm uppercase tracking-widest text-nl-black/50 mt-4">
                Choose a song to listen to during the checkout 🎶
              </p>
            </div>
            <button onClick={onClose} className="text-nl-black/30 hover:text-nl-black text-2xl leading-none transition-colors">×</button>
          </div>

          <div className="px-8 py-4 pb-8">
            <SongPicker
              songs={songs}
              selected={draft.song_choice ?? null}
              onSelect={onSongChange}
            />
          </div>

          <div className="flex items-center justify-between px-8 py-5 border-t border-nl-black/10">
            <button
              onClick={onBack}
              className="font-semibold text-sm text-nl-black/40 hover:text-nl-black transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onNext}
              disabled={!draft.song_choice}
              className={`font-bold text-sm px-8 py-3 rounded-xl transition-colors
                ${draft.song_choice
                  ? 'bg-nl-black text-nl-white hover:bg-nl-purple-dark cursor-pointer'
                  : 'bg-nl-black/10 text-nl-black/30 cursor-not-allowed'
                }`}
            >
              Continue →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Steps 1+: normal wizard ────────────────────────────────────────────────
  const progress = (step / STEPS.length) * 100
  const p = photoUrl ? 1 : 0

  const canProceed =
    step === 1 ? draft.name.trim() !== '' && draft.emoji !== '' :
    step === 2 ? draft.mood !== null :
    photoUrl && step === 3 ? true :
    step === 3 + p ? (draft.wins.length > 0 || achievementsPending.wins) && (draft.learnings.length > 0 || achievementsPending.learnings) :
    step === 4 + p ? draft.funAnswer !== null :
    step === 5 + p ? draft.weekend.trim() !== '' :
    true

  const isMoodStep = step === 2

  return (
    <div className="fixed inset-0 bg-nl-beige/90 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className={`bg-nl-white flex flex-col shadow-xl rounded-2xl overflow-hidden animate-fade-up
        ${isMoodStep ? 'w-fit' : 'w-full max-w-lg'}`}
      >

        {/* Progress bar */}
        <div className="h-1 bg-nl-black/10 w-full">
          <div
            className="h-full bg-nl-purple transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-6 pb-2">
          <div>
            <p className="font-semibold text-xs uppercase tracking-widest text-nl-black/40">
              Step {step} of {STEPS.length}
            </p>
            <h2 className="font-black text-2xl text-nl-black mt-0.5">
              {STEPS[step - 1]}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-nl-black/30 hover:text-nl-black text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Step content */}
        <div className="px-8 py-6 overflow-y-auto">
          {step === 1 && (
            <Identity name={draft.name} emoji={draft.emoji} onChange={onDraftChange} />
          )}
          {step === 2 && (
            <MoodMeter emoji={draft.emoji} name={draft.name} selected={draft.mood} onSelect={onMoodChange} />
          )}
          {photoUrl && step === 3 && (
            <WeekRecap photoUrl={photoUrl} />
          )}
          {step === 3 + p && (
            <Achievements ref={achievementsRef} wins={draft.wins} learnings={draft.learnings} onChange={onAchievementsChange} onPendingChange={setAchievementsPending} />
          )}
          {step === 4 + p && (
            <FunQuestion selected={draft.funAnswer} onSelect={onFunAnswerChange} questionIndex={questionIndex} />
          )}
          {step === 5 + p && (
            <Weekend value={draft.weekend} onChange={onWeekendChange} />
          )}
          {step === 6 + p && (
            <Drawing strokes={draft.drawing} onChange={onDrawingChange} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-nl-black/10">
          <button
            onClick={onBack}
            className="font-semibold text-sm text-nl-black/40 hover:text-nl-black transition-colors cursor-pointer"
          >
            {step === 1 ? '← Back' : '← Back'}
          </button>
          <button
            ref={submitRef}
            onClick={handleNext}
            disabled={!canProceed}
            className={`font-bold text-sm px-8 py-3 rounded-xl transition-colors
              ${canProceed
                ? 'bg-nl-black text-nl-white hover:bg-nl-purple-dark cursor-pointer'
                : 'bg-nl-black/10 text-nl-black/30 cursor-not-allowed'
              }`}
          >
            {step === STEPS.length ? 'Submit →' : 'Continue →'}
          </button>
        </div>

      </div>
    </div>
  )
}
