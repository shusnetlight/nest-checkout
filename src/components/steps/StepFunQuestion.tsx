import { useMemo } from 'react'

export interface FunAnswer {
  a: string
  b: string
  answer: 'a' | 'b'
}

interface Props {
  selected: FunAnswer | null
  onSelect: (a: FunAnswer) => void
  questionIndex: number
}

const QUESTIONS: { a: string; b: string }[] = [
  { a: '🛋️ Home Office: Pajamas all day',     b: '👖 Home Office: Normal trousers' },
  { a: '💻 Laptop stickers everywhere',       b: '✨ Spotless laptop, always' },
  { a: '🏃🏼 Deadline: Last-minute sprint',    b: '😌 Deadline: Done two days early' },
  { a: '🎤 Presentation: Full freestyle',    b: '📋 Presentation: Stick to the script' },
  { a: '🔕 Slack: Batched reply windows',    b: '💬 Slack: Reply within minutes' },
  { a: '🌲 Holiday activity: Hiking',        b: '🏖️ Holiday activity: Beach bar' },
  { a: '☕ Coffee: Black, no nonsense',       b: '🧋 Coffee: Oat latte with a syrup' },
  { a: '🎯 Feedback: Blunt and direct',      b: '🕊️ Feedback: Wrapped and diplomatic' },
  { a: '🏃 After work: Straight to the gym', b: '🛁 After work: Couch' },
  { a: '📅 Weekend: Fully planned',          b: '🎲 Weekend: Completely spontaneous' },
  { a: '🔊 Music while working: Always',     b: '🔇 Music while working: Never' },
  { a: '🌙 Peak productivity: Night owl',    b: '🌅 Peak productivity: Early bird' },
  { a: '🍕 Pizza',                           b: '🍝 Pasta' },
]

export default function StepFunQuestion({ selected, onSelect, questionIndex }: Props) {
  const q = useMemo(() => QUESTIONS[questionIndex % QUESTIONS.length], [questionIndex])

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        Rather A or B?
      </label>

      <div className="flex flex-col gap-3">
        {(['a', 'b'] as const).map(side => {
          const isSelected = selected?.answer === side
          return (
            <button
              key={side}
              onClick={() => onSelect({ a: q.a, b: q.b, answer: side })}
              className={`text-left px-5 py-5 rounded-xl border-2 transition-all
                ${isSelected
                  ? 'border-nl-purple bg-nl-purple/10 shadow-sm scale-[1.01]'
                  : 'border-nl-black/10 bg-nl-white hover:border-nl-purple/50 hover:bg-nl-purple/5'
                }`}
            >
              <span className="font-black text-xs uppercase tracking-widest text-nl-black/30 mr-3">
                {side.toUpperCase()}
              </span>
              <span className="font-bold text-base text-nl-black">{q[side]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
