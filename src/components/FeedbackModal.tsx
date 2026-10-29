import { useState } from 'react'

const MAX_LENGTH = 2000

interface Props {
  nestName: string
  sessionId: string
  onClose: () => void
}

export default function FeedbackModal({ nestName, sessionId, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function send() {
    if (!message.trim()) return
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          nest: nestName,
          sessionId,
        }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 bg-nl-beige/90 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6" onClick={onClose}>
      <div
        className="bg-nl-white flex flex-col shadow-xl rounded-2xl overflow-hidden animate-fade-up w-full max-w-lg max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-4 sm:px-8 pt-6 pb-2 shrink-0">
          <h2 className="font-black text-2xl text-nl-black">Share your feedback 💬</h2>
          <button onClick={onClose} className="text-nl-black/30 hover:text-nl-black text-2xl leading-none transition-colors cursor-pointer">×</button>
        </div>

        {status === 'sent' ? (
          <div className="px-4 sm:px-8 py-8 flex flex-col items-center text-center gap-3">
            <span className="text-5xl">🙌</span>
            <p className="font-black text-lg text-nl-black">Thank you!</p>
            <p className="text-sm text-nl-black/60 max-w-sm">Your feedback is on its way and will help shape the next version of the Nest Checkout.</p>
            <button
              onClick={onClose}
              className="mt-4 font-bold text-sm px-8 py-3 rounded-xl bg-nl-black text-nl-white hover:bg-nl-purple-dark transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="px-4 sm:px-8 py-4 flex flex-col gap-4 overflow-y-auto flex-1">
              <p className="text-sm text-nl-black/70 leading-relaxed">
                How is the Nest Checkout working for you? I'd love to hear what you enjoy, what feels clunky,
                and which features or improvements you'd like to see next. Every note helps make the next checkout a little better.
                <span className="block mt-2 text-nl-black/50">Your feedback is sent anonymously.</span>
              </p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value.slice(0, MAX_LENGTH))}
                placeholder="Your feedback, ideas or feature wishes..."
                rows={6}
                autoFocus
                className="border-2 border-nl-black/10 focus:border-nl-purple outline-none px-4 py-3 text-base text-nl-black placeholder:text-nl-black/30 transition-colors rounded-xl resize-none"
              />
              <p className="text-xs text-nl-black/50 leading-relaxed bg-nl-purple/10 px-4 py-3 rounded-xl border-l-4 border-nl-purple">
                Want to help shape what comes next? If you'd like to contribute with UX, UI or frontend support,
                feel free to reach out to <span className="font-bold text-nl-black/70">@Sarah Husslein</span> on Slack.
              </p>
              {status === 'error' && (
                <p className="text-sm font-semibold text-red-600">Sorry, your feedback could not be sent. Please try again.</p>
              )}
            </div>

            <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-t border-nl-black/10 shrink-0">
              <button onClick={onClose} className="font-semibold text-sm text-nl-black/40 hover:text-nl-black transition-colors cursor-pointer">
                Cancel
              </button>
              <button
                onClick={send}
                disabled={!message.trim() || status === 'sending'}
                className={`font-bold text-sm px-8 py-3 rounded-xl transition-colors
                  ${message.trim() && status !== 'sending'
                    ? 'bg-nl-black text-nl-white hover:bg-nl-purple-dark cursor-pointer'
                    : 'bg-nl-black/10 text-nl-black/30 cursor-not-allowed'
                  }`}
              >
                {status === 'sending' ? 'Sending...' : 'Send feedback →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
