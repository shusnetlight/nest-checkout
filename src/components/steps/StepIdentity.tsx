const ANIMALS = ['🦊', '🐺', '🦁', '🐯', '🐻', '🐼', '🐸', '🐿️', '🦉', '🦋', '🦖', '🦄', '🐙', '🦩', '🐆', '🦝']

interface Props {
  name: string
  emoji: string
  onChange: (field: 'name' | 'emoji', value: string) => void
}

export default function StepIdentity({ name, emoji, onChange }: Props) {
  return (
    <div className="flex flex-col gap-8">

      {/* Name input */}
      <div className="flex flex-col gap-2">
        <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
          Your name or alias
        </label>
        <input
          type="text"
          value={name}
          onChange={e => onChange('name', e.target.value)}
          placeholder="e.g. Lou, The Pretzel, ..."
          className="border-2 border-nl-black/10 focus:border-nl-purple outline-none px-4 py-3 text-lg font-normal text-nl-black placeholder:text-nl-black/30 transition-colors rounded-xl"
        />
      </div>

      {/* Emoji picker — only shown after name is entered */}
      {name.trim() !== '' && (
        <div className="flex flex-col gap-3 animate-fade-up">
          <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
            Pick your character
          </label>
          <div className="grid grid-cols-8 gap-2">
            {ANIMALS.map(animal => (
              <button
                key={animal}
                onClick={() => onChange('emoji', animal)}
                className={`text-2xl h-12 w-full flex items-center justify-center rounded-xl transition-all
                  ${emoji === animal
                    ? 'bg-nl-purple scale-110 shadow-md'
                    : 'bg-nl-black/5 hover:bg-nl-purple/30'
                  }`}
              >
                {animal}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Preview */}
      {name && emoji && (
        <div className="flex items-center gap-3 bg-nl-purple/10 px-4 py-3 rounded-xl border-l-4 border-nl-purple animate-fade-up">
          <span className="text-3xl">{emoji}</span>
          <span className="font-bold text-nl-black">{name}</span>
        </div>
      )}

    </div>
  )
}
