import { useState, useRef } from 'react'

interface Props {
  wins: string[]
  learnings: string[]
  onChange: (field: 'wins' | 'learnings', items: string[]) => void
}

function BulletInput({
  label,
  placeholder,
  items,
  onAdd,
  onRemove,
}: {
  label: string
  placeholder: string
  items: string[]
  onAdd: (val: string) => void
  onRemove: (i: number) => void
}) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const trimmed = value.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setValue('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); submit() }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        {label}
      </label>

      {/* Added items */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-2 bg-nl-purple/10 px-3 py-2 rounded-xl border-l-4 border-nl-purple animate-fade-up"
            >
              <span className="text-nl-purple font-bold shrink-0">✓</span>
              <span className="text-sm font-semibold text-nl-black flex-1">{item}</span>
              <button
                onClick={() => onRemove(i)}
                className="text-nl-black/30 hover:text-nl-black text-base leading-none transition-colors shrink-0"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 border-2 border-nl-black/10 focus:border-nl-purple outline-none px-4 py-2.5 text-sm font-normal text-nl-black placeholder:text-nl-black/30 transition-colors rounded-xl"
        />
        <button
          onClick={submit}
          disabled={!value.trim()}
          className={`font-bold text-sm px-4 py-2.5 rounded-xl transition-colors shrink-0
            ${value.trim()
              ? 'bg-nl-purple text-nl-white hover:bg-nl-purple-dark'
              : 'bg-nl-black/10 text-nl-black/30 cursor-not-allowed'
            }`}
        >
          + Add
        </button>
      </div>
    </div>
  )
}

export default function Achievements({ wins, learnings, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <BulletInput
        label="What's your greatest achievement this week?"
        placeholder="e.g. nailed a G2K, finishing self-reflection..."
        items={wins}
        onAdd={val => onChange('wins', [...wins, val])}
        onRemove={i => onChange('wins', wins.filter((_, idx) => idx !== i))}
      />
      <BulletInput
        label="What's your biggest learning this week?"
        placeholder="e.g. whiteboard sucks..."
        items={learnings}
        onAdd={val => onChange('learnings', [...learnings, val])}
        onRemove={i => onChange('learnings', learnings.filter((_, idx) => idx !== i))}
      />
    </div>
  )
}
