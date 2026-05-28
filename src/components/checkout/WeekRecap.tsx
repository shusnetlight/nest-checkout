import { useState } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  photoUrl: string
}

export default function WeekRecap({ photoUrl }: Props) {
  const [zoomed, setZoomed] = useState(false)

  return (
    <div className="flex flex-col gap-5 animate-fade-up">
      <p className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        Take a moment to look back at what you set out to achieve this week.
      </p>

      <div className="relative cursor-zoom-in group w-fit mx-auto" onClick={() => setZoomed(true)}>
        <img src={photoUrl} className="max-h-96 w-auto rounded-xl shadow-md block" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-xl" />
        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-sm">
          🔍 Click to zoom
        </div>
      </div>

      {zoomed && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/85 flex items-center justify-center cursor-zoom-out p-6 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <img
            src={photoUrl}
            className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
          />
        </div>,
        document.body
      )}
    </div>
  )
}
