interface Props {
  value: string
  onChange: (v: string) => void
}

const MAX = 160

export default function Weekend({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-6 animate-fade-up">

      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        One highlight of your upcoming weekend?
      </label>

      <div className="flex flex-col gap-1.5">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, MAX))}
          // placeholder="e.g. Tried a new recipe, hiked somewhere unexpected, finally fixed that shelf..."
          rows={4}
          className="border-2 border-nl-black/10 focus:border-nl-purple outline-none px-4 py-3 text-base font-normal text-nl-black placeholder:text-nl-black/30 transition-colors rounded-xl resize-none"
        />
        <span className="text-xs text-nl-black/30 text-right font-semibold">
          {value.length} / {MAX}
        </span>
      </div>

    </div>
  )
}
