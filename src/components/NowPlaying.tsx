import type { Song } from '../lib/songs'

export default function NowPlaying({ song }: { song: Song }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      {/* Hidden iframe for audio-only playback */}
      <iframe
        key={song.id}
        src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1`}
        width="1"
        height="1"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        allow="autoplay; clipboard-write; encrypted-media"
        title={song.title}
      />

      {/* Visible bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-xl border border-nl-black/10 bg-nl-white">
        <span className="text-base leading-none">{song.emoji}</span>
        <div className="text-left min-w-0">
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
      </div>
    </div>
  )
}
