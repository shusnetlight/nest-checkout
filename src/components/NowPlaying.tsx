import { useState, useRef, useEffect } from 'react'
import type { Song } from '../lib/songs'

export default function NowPlaying({ song }: { song: Song }) {
  const [muted, setMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Reset mute state when song changes
  useEffect(() => { setMuted(false) }, [song.id])

  function toggleMute() {
    const cmd = muted ? 'unMute' : 'mute'
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*'
    )
    setMuted(m => !m)
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <iframe
        key={song.id}
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1&enablejsapi=1`}
        width="1"
        height="1"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        allow="autoplay; clipboard-write; encrypted-media"
        title={song.title}
      />

      <div className="flex items-center gap-4 px-5 py-3 rounded-2xl shadow-xl border border-nl-black/10 bg-nl-white">
        <div className="text-left min-w-0">
          <p className="text-xs font-black text-nl-black leading-tight truncate">{song.title}</p>
          <p className="text-[10px] text-nl-black/50 leading-tight truncate">{song.artist}</p>
        </div>
        <button
          onClick={toggleMute}
          className="flex items-center gap-1.5 shrink-0 cursor-pointer group"
          title={muted ? 'Unmute' : 'Mute'}
        >
          <span className="text-sm leading-none text-nl-black/30 group-hover:text-nl-black transition-colors">
            {muted ? '🔇' : '🔊'}
          </span>
          <div className="flex items-end gap-0.5 h-4">
            {[3, 5, 2, 4, 3].map((h, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-nl-purple-dark"
                style={{
                  height: `${h * 3}px`,
                  animation: muted ? 'none' : `bounce 0.8s ease-in-out ${i * 0.12}s infinite alternate`,
                  opacity: muted ? 0.3 : 1,
                }}
              />
            ))}
          </div>
        </button>
      </div>
    </div>
  )
}
