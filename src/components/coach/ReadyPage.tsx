import { useState } from 'react'
import { Check, Copy, Link } from 'lucide-react'
import NestBackground from '../NestBackground'

interface Props {
  sessionId: string
  nestName: string
  nestEmoji: string
  onStart: () => void
  onNavigate: (step: number) => void
}

export default function ReadyPage({ sessionId, nestName, nestEmoji, onStart, onNavigate }: Props) {
  const [copied, setCopied] = useState(false)
  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
  const shareUrl = `${window.location.origin}?nest=${toSlug(nestName)}&session=${sessionId}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative z-10 min-h-screen bg-nl-beige flex flex-col items-center justify-center px-8">
      <NestBackground emojis={[nestEmoji]} />

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-12">
        {['Select Nest', 'Add Photo', 'Share & Start'].map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            {i < 2 ? (
              <button
                onClick={() => onNavigate(i)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-nl-purple/20 text-nl-purple-dark hover:bg-nl-purple/30 transition-colors cursor-pointer"
              >
                <Check size={11} />
                <span className="leading-none">{label}</span>
              </button>
            ) : (
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-nl-purple-dark text-nl-white">
                <span className="leading-none">{label}</span>
              </div>
            )}
            {i < 2 && <span className="text-nl-black/20 text-xs">→</span>}
          </div>
        ))}
      </div>

      <p className="font-normal uppercase text-xl text-nl-purple-dark mb-4">
        {nestEmoji.startsWith('/') ? <img src={nestEmoji} className="inline-block w-5 h-5 object-contain align-middle mr-1" /> : nestEmoji} {nestName}
      </p>

      <h1 className="font-black text-6xl text-nl-black text-center leading-tight mb-4">
        You're all set! 🎉
      </h1>

      <p className="font-normal text-lg text-nl-black/70 text-center max-w-lg mb-12">
        Share the link below with your team — they'll land on the welcome screen
        and can jump straight into the checkout.
      </p>

      {/* Link box */}
      <div
        onClick={copyLink}
        className="w-full max-w-lg bg-nl-white rounded-2xl border-2 border-nl-black/10 hover:border-nl-purple/40 px-5 py-4 flex items-center gap-3 mb-12 cursor-pointer transition-colors"
      >
        <Link size={16} className="text-nl-black/30 shrink-0" />
        <span className="text-sm text-nl-black/50 font-mono truncate flex-1">{shareUrl}</span>
        <button
          onClick={e => { e.stopPropagation(); copyLink() }}
          className={`shrink-0 flex items-center gap-1.5 font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer
            ${copied
              ? 'bg-nl-purple/20 text-nl-purple-dark'
              : 'bg-nl-black text-nl-white hover:bg-nl-purple-dark'
            }`}
        >
          {copied ? <><Check size={13} /><span className="leading-none">Copied!</span></> : <><Copy size={13} /><span className="leading-none">Copy link</span></>}
        </button>
      </div>


      <button
        onClick={onStart}
        className="relative z-10 font-bold text-base px-10 py-4 rounded-xl bg-nl-purple-dark text-nl-white hover:bg-nl-purple hover:text-nl-black transition-colors cursor-pointer"
      >
        Let's Go →
      </button>
    </div>
  )
}
