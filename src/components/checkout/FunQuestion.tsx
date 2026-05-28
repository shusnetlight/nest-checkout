import { useMemo } from 'react'
import { QUESTIONS } from '../../data/questions'

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

export default function FunQuestion({ selected, onSelect, questionIndex }: Props) {
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
