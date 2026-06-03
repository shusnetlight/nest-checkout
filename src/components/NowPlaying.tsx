import { useState, useRef, useEffect } from 'react'
import type { Song } from '../lib/songs'

interface Props {
  songs: Song[]
  initialSongId?: string
}

export default function NowPlaying({ songs, initialSongId }: Props) {
  const initialIndex = initialSongId
    ? Math.max(0, songs.findIndex(s => s.id === initialSongId))
    : 0
  const [index, setIndex] = useState(initialIndex)
  const [volume, setVolume] = useState(80)
  const prevVolumeRef = useRef(80)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const song = songs[index]

  useEffect(() => { setVolume(80); prevVolumeRef.current = 80 }, [song?.id])

  if (!song) return null

  function sendVolume(v: number) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: 'setVolume', args: [v] }),
      '*'
    )
  }

  function handleVolume(v: number) {
    if (v > 0) prevVolumeRef.current = v
    setVolume(v)
    sendVolume(v)
  }

  function toggleMute() {
    if (volume === 0) {
      const restore = prevVolumeRef.current || 80
      setVolume(restore)
      sendVolume(restore)
    } else {
      prevVolumeRef.current = volume
      setVolume(0)
      sendVolume(0)
    }
  }

  function prev() { setIndex(i => (i - 1 + songs.length) % songs.length) }
  function next() { setIndex(i => (i + 1) % songs.length) }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100]">
      <iframe
        key={song.id}
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`}
        width="1"
        height="1"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
        allow="autoplay; clipboard-write; encrypted-media"
        title={song.title}
      />

      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-nl-black/10 bg-nl-white">

        {/* Prev */}
        <button onClick={prev} className="w-7 h-7 flex items-center justify-center rounded-lg text-nl-black/30 hover:text-nl-black hover:bg-nl-black/6 transition-all cursor-pointer text-lg font-bold leading-none" title="Previous">‹</button>

        {/* Song info */}
        <div className="text-left min-w-0 max-w-36">
          <p className="text-xs font-black text-nl-black leading-tight truncate">{song.title}</p>
          <p className="text-[10px] text-nl-black/50 leading-tight truncate">{song.artist}</p>
        </div>

        {/* Next */}
        <button onClick={next} className="w-7 h-7 flex items-center justify-center rounded-lg text-nl-black/30 hover:text-nl-black hover:bg-nl-black/6 transition-all cursor-pointer text-lg font-bold leading-none" title="Next">›</button>

        {/* Volume */}
        <div className="flex items-center gap-2 shrink-0 border-l border-nl-black/10 pl-3">
          <button onClick={toggleMute} className="text-sm leading-none text-nl-black/30 hover:text-nl-black transition-colors cursor-pointer" title={volume === 0 ? 'Unmute' : 'Mute'}>
            {volume === 0 ? '🔇' : '🔊'}
          </button>

          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={e => handleVolume(Number(e.target.value))}
            className="w-20 h-1 accent-nl-purple-dark cursor-pointer"
          />

          <div className="flex items-end gap-0.5 h-4">
            {[0.6, 1, 0.4, 0.85, 0.5].map((scale, i) => (
              <div
                key={i}
                className="w-0.5 rounded-full bg-nl-purple-dark"
                style={{
                  height: '16px',
                  transformOrigin: 'bottom',
                  transform: volume === 0 ? 'scaleY(0.15)' : undefined,
                  animation: volume === 0 ? 'none' : `equalizer ${0.5 + scale * 0.5}s ease-in-out ${i * 0.1}s infinite alternate`,
                  opacity: volume === 0 ? 0.2 : Math.max(0.4, volume / 100),
                  transition: 'opacity 0.2s, transform 0.2s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
