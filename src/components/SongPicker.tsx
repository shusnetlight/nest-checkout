import type { Song } from '../lib/songs'

interface Props {
  songs: Song[]
  selected: string | null
  votes: Record<string, number>
  onSelect: (id: string) => void
}

export default function SongPicker({ songs, selected, votes, onSelect }: Props) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-3">
      <p className="font-semibold text-xs uppercase tracking-widest text-nl-black/40">
        🎵 Vote for this week's vibe
      </p>
      <div className="flex gap-3">
        {songs.map(song => {
          const isSelected = selected === song.id
          const count = votes[song.id] ?? 0
          return (
            <button
              key={song.id}
              onClick={() => onSelect(song.id)}
              className={`flex flex-col items-center gap-2 px-5 py-4 rounded-xl border-2 cursor-pointer transition-all w-36
                ${isSelected
                  ? 'border-nl-purple-dark bg-nl-purple/20'
                  : 'border-nl-black/10 bg-nl-white/60 hover:border-nl-black/30'
                }`}
            >
              <span className="text-3xl leading-none">{song.emoji}</span>
              <div className="flex flex-col items-center gap-0.5">
                <span className="font-black text-sm text-nl-black text-center leading-tight">{song.title}</span>
                <span className="font-normal text-[10px] text-nl-black/50 text-center leading-tight">{song.artist}</span>
              </div>
              {count > 0 && (
                <span className="text-[10px] font-bold text-nl-purple-dark">
                  {count} {count === 1 ? 'vote' : 'votes'}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
