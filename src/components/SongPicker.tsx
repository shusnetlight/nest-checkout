import type { Song } from '../lib/songs'

interface Props {
  songs: Song[]
  selected: string | null
  votes: Record<string, number>
  onSelect: (id: string) => void
}

export default function SongPicker({ songs, selected, votes, onSelect }: Props) {
  return (
    <div className="flex gap-3 justify-center">
      {songs.map(song => {
        const isSelected = selected === song.id
        const count = votes[song.id] ?? 0
        return (
          <button
            key={song.id}
            onClick={() => onSelect(song.id)}
            className={`flex flex-col overflow-hidden rounded-xl border-2 cursor-pointer transition-all w-40
              ${isSelected
                ? 'border-nl-purple-dark shadow-md'
                : 'border-nl-black/10 hover:border-nl-black/30'
              }`}
          >
            <div className="relative w-full aspect-video overflow-hidden bg-nl-black/5">
              <img
                src={`https://img.youtube.com/vi/${song.ytId}/mqdefault.jpg`}
                alt={song.title}
                className="w-full h-full object-cover"
              />
              {isSelected && (
                <div className="absolute inset-0 bg-nl-purple/30 flex items-center justify-center">
                  <span className="text-xl">✓</span>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-nl-white">
              <span className="font-black text-xs text-nl-black leading-tight truncate">{song.title}</span>
              <span className="font-normal text-[10px] text-nl-black/50 leading-tight truncate">{song.artist}</span>
              {count > 0 && (
                <span className="text-[10px] font-bold text-nl-purple-dark mt-0.5">
                  {count} {count === 1 ? 'vote' : 'votes'}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
