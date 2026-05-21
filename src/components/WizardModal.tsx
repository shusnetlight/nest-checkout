import StepIdentity from './steps/StepIdentity'
import StepMoodMeter, { type MoodSelection } from './steps/StepMoodMeter'
import StepAchievements from './steps/StepAchievements'
import StepFunQuestion, { type FunAnswer } from './steps/StepFunQuestion'
import StepWeekend from './steps/StepWeekend'

const STEPS = [
  'Your Identity',
  'Mood Check',
  'Achievements',
  'Fun Question',
  'Weekend Plans',
]

interface Draft {
  name: string
  emoji: string
  mood: MoodSelection | null
  wins: string[]
  learnings: string[]
  funAnswer: FunAnswer | null
  weekend: string
}

interface Props {
  step: number
  draft: Draft
  questionIndex: number
  onDraftChange: (field: 'name' | 'emoji', value: string) => void
  onMoodChange: (mood: MoodSelection) => void
  onAchievementsChange: (field: 'wins' | 'learnings', items: string[]) => void
  onFunAnswerChange: (a: FunAnswer) => void
  onWeekendChange: (v: string) => void
  onNext: () => void
  onBack: () => void
  onClose: () => void
}

export default function WizardModal({ step, draft, questionIndex, onDraftChange, onMoodChange, onAchievementsChange, onFunAnswerChange, onWeekendChange, onNext, onBack, onClose }: Props) {
  const progress = (step / STEPS.length) * 100

  const canProceed =
    step === 1 ? draft.name.trim() !== '' && draft.emoji !== '' :
    step === 2 ? draft.mood !== null :
    step === 3 ? draft.wins.length > 0 || draft.learnings.length > 0 :
    step === 4 ? draft.funAnswer !== null :
    step === 5 ? draft.weekend.trim() !== '' :
    true

  return (
    <div className="fixed inset-0 bg-nl-beige/90 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">

      <div className={`bg-nl-white flex flex-col shadow-xl rounded-2xl overflow-hidden animate-fade-up
        ${step === 2 ? 'w-fit' : 'w-full max-w-lg'}`}
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
            <StepIdentity
              name={draft.name}
              emoji={draft.emoji}
              onChange={onDraftChange}
            />
          )}
          {step === 2 && (
            <StepMoodMeter
              emoji={draft.emoji}
              name={draft.name}
              selected={draft.mood}
              onSelect={onMoodChange}
            />
          )}
          {step === 3 && (
            <StepAchievements
              wins={draft.wins}
              learnings={draft.learnings}
              onChange={onAchievementsChange}
            />
          )}
          {step === 4 && (
            <StepFunQuestion
              selected={draft.funAnswer}
              onSelect={onFunAnswerChange}
              questionIndex={questionIndex}
            />
          )}
          {step === 5 && (
            <StepWeekend
              value={draft.weekend}
              onChange={onWeekendChange}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-nl-black/10">
          <button
            onClick={onBack}
            className="font-semibold text-sm text-nl-black/40 hover:text-nl-black transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className={`font-bold text-sm px-8 py-3 rounded-xl transition-colors
              ${canProceed
                ? 'bg-nl-black text-nl-white hover:bg-nl-purple-dark'
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
