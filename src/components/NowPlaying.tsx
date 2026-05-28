import { useState } from 'react'
import type { Song } from '../lib/songs'

export default function NowPlaying({ song }: { song: Song }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed bottom-4 right-4 z-[100] rounded-2xl overflow-hidden shadow-xl border border-nl-black/10 bg-nl-white">
      {open && (
        <iframe
          key={song.id}
          src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1`}
          width="280"
          height="158"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="block"
          title={`${song.title} - ${song.artist}`}
        />
      )}
      <button
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-nl-black/5 transition-colors"
      >
        <span className="text-base leading-none">{song.emoji}</span>
        <div className="flex-1 text-left min-w-0">
          <p className="text-xs font-black text-nl-black leading-tight truncate">{song.title}</p>
          <p className="text-[10px] text-nl-black/50 leading-tight truncate">{song.artist}</p>
        </div>
        <div className="flex items-end gap-0.5 shrink-0 h-4">
          {[3, 5, 2, 4, 3].map((h, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full bg-nl-purple-dark"
              style={{
                height: `${h * 3}px`,
                animation: `bounce 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
              }}
            />
          ))}
        </div>
      </button>
    </div>
  )
}
