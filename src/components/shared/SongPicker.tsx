import type { Song } from '../../data/songs'

interface Props {
  songs: Song[]
  selected: string | null
  onSelect: (id: string) => void
}

export default function SongPicker({ songs, selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 justify-center items-stretch pt-2">
      {songs.map(song => {
        const isSelected = selected === song.id
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
            <div className="w-full aspect-video overflow-hidden bg-nl-black/5">
              <img
                src={`https://img.youtube.com/vi/${song.ytId}/mqdefault.jpg`}
                alt={song.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-0.5 px-3 py-2.5 bg-nl-white flex-1">
              <span className="font-black text-xs text-nl-black leading-tight">{song.title}</span>
              <span className="font-normal text-[10px] text-nl-black/50 leading-tight">{song.artist}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
