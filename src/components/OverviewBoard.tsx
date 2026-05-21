import { useState, useRef } from 'react'
import { toPng } from 'html-to-image'
import type { Draft } from '../App'

export interface Submission extends Draft {
  colorIdx: number
}

const COLORS = [
  { bg: '#E8E4FF', border: '#6664F1' }, // purple
  { bg: '#FFF9CC', border: '#EFD500' }, // yellow
  { bg: '#C2F9FF', border: '#00AADF' }, // blue
  { bg: '#FFD0FF', border: '#E166D5' }, // pink
  { bg: '#C8FFFB', border: '#32DF19' }, // green
  { bg: '#FFE4CC', border: '#FF8C00' }, // orange
]

export function colorOf(idx: number) {
  return COLORS[idx % COLORS.length]
}

// ── Mood Board ────────────────────────────────────────────────────────────────

const GRID = [
  ['Enraged',   'Stressed',  'Shocked',   'Surprised', 'Festive',   'Ecstatic' ],
  ['Fuming',    'Angry',     'Restless',  'Energized', 'Optimistic','Excited'  ],
  ['Repulsed',  'Worried',   'Uneasy',    'Pleasant',  'Hopeful',   'Blissful' ],
  ['Disgusted', 'Down',      'Apathetic', 'At ease',   'Content',   'Fulfilled'],
  ['Miserable', 'Lonely',    'Tired',     'Relaxed',   'Restful',   'Balanced' ],
  ['Despair',   'Desolate',  'Drained',   'Sleepy',    'Tranquil',  'Serene'   ],
]

function cellColor(row: number, col: number): string {
  const isUnpleasant = col < 3
  const isHighEnergy = row < 3
  const d = Math.max(isUnpleasant ? 2 - col : col - 3, isHighEnergy ? 2 - row : row - 3)
  if (isHighEnergy && isUnpleasant)  return ['#FFD0FF', '#FF99FF', '#E166D5'][d]
  if (isHighEnergy && !isUnpleasant) return ['#FFF9CC', '#FFF400', '#EFD500'][d]
  if (!isHighEnergy && isUnpleasant) return ['#C2F9FF', '#6CDBFF', '#00AADF'][d]
  return ['#C8FFFB', '#77FFF8', '#32DF19'][d]
}

const BOARD = 360

function MoodBoard({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex gap-3 items-stretch">

        {/* Y-axis */}
        <div className="flex flex-col items-center justify-between shrink-0 w-10 " style={{ height: BOARD }}>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">HIGH<br/>ENERGY</span>
          <div className="flex flex-col items-center flex-1 justify-center gap-1 py-1">
            <span className="text-lg font-bold text-nl-black/50 leading-none">↑</span>
            <div className="flex-1 w-px bg-nl-black/30" />
            <span className="text-lg font-bold text-nl-black/50 leading-none">↓</span>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">LOW<br/>ENERGY</span>
        </div>

        {/* Board */}
        <div className="relative rounded-xl overflow-hidden shrink-0" style={{ width: BOARD, height: BOARD }}>
          <div className="grid grid-cols-6 gap-px bg-white/40 w-full h-full">
            {GRID.map((row, rIdx) =>
              row.map((label, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{ backgroundColor: cellColor(rIdx, cIdx) }}
                  className="flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-nl-black/70 text-center leading-tight px-0.5 select-none">
                    {label}
                  </span>
                </div>
              ))
            )}
          </div>
          {submissions.map((s, i) => s.mood && (
            <div
              key={i}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${s.mood.x}%`, top: `${s.mood.y}%`, zIndex: 10 + i }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-base shadow-md border-2"
                style={{ backgroundColor: colorOf(s.colorIdx).bg, borderColor: colorOf(s.colorIdx).border }}
                title={`${s.emoji} ${s.name}`}
              >
                {s.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* X-axis */}
      <div className="flex items-center gap-2 mt-2 pt-3" style={{ paddingLeft: 52 }}>
        <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Unpleasant</span>
        <div className="flex items-center flex-1 gap-1">
          <span className="text-lg font-bold text-nl-black/50 leading-none">←</span>
          <div className="flex-1 h-px bg-nl-black/30" />
          <span className="text-lg font-bold text-nl-black/50 leading-none">→</span>
        </div>
        <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Pleasant</span>
      </div>
    </div>
  )
}

// ── A or B Card ───────────────────────────────────────────────────────────────

function AOrBCard({ s }: { s: Submission }) {
  if (!s.funAnswer) return null
  const c = colorOf(s.colorIdx)
  const { a, b, answer } = s.funAnswer
  return (
    <div
      className="flex flex-col rounded-xl border-l-4 overflow-hidden px-3 py-2 gap-1.5"
      style={{ borderColor: c.border, backgroundColor: c.bg }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-nl-black/80">
        {s.emoji} {s.name}
      </span>
      {(['a', 'b'] as const).map(side => {
        const isChosen = answer === side
        return (
          <div
            key={side}
            className="flex items-start gap-2"
          >
            <span
              className="font-black text-[10px] uppercase tracking-widest mt-0.5 shrink-0 w-3"
              style={{ color: isChosen ? c.border : '#00000033' }}
            >
              {side.toUpperCase()}
            </span>
            <span
              className={`text-sm leading-snug ${isChosen ? 'font-bold text-nl-black' : 'font-normal text-nl-black/30'}`}
            >
              {side === 'a' ? a : b}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Sticky Note ───────────────────────────────────────────────────────────────

function StickyNote({ text, s }: { text: string; s: Submission }) {
  const c = colorOf(s.colorIdx)
  return (
    <div
      className="flex flex-col gap-1 px-3 py-2.5 rounded-xl border-l-4"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <span className="text-[10px] font-black uppercase tracking-widest text-nl-black/80">
        {s.emoji} {s.name}
      </span>
      <span className="text-sm font-semibold text-nl-black leading-snug">{text}</span>
    </div>
  )
}

// ── Section Column ────────────────────────────────────────────────────────────

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 min-w-0 flex-1">
      <h3 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2">
        {title}
      </h3>
      <div className="flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

// ── Person Header ─────────────────────────────────────────────────────────────

function PersonTag({ s }: { s: Submission }) {
  const c = colorOf(s.colorIdx)
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border"
      style={{ backgroundColor: c.bg, borderColor: c.border }}
    >
      <span>{s.emoji}</span>
      <span>{s.name}</span>
    </div>
  )
}

// ── Overview Board ────────────────────────────────────────────────────────────

interface Props {
  submissions: Submission[]
  sessionId: string
  onAddPerson: () => void
  onReset: () => void
}

export default function OverviewBoard({ submissions, sessionId, onAddPerson: _onAddPerson, onReset }: Props) {
  const shareUrl = `${window.location.origin}?session=${sessionId}`
  const [copied, setCopied] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const boardRef = useRef<HTMLDivElement>(null)

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function takeScreenshot() {
    if (!boardRef.current) return
    setScreenshotting(true)
    try {
      const dataUrl = await toPng(boardRef.current, { pixelRatio: 2, backgroundColor: '#FFF0E6' })
      const link = document.createElement('a')
      link.download = `nest-checkout-${sessionId}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      setScreenshotting(false)
    }
  }

  return (
    <div ref={boardRef} className="min-h-screen bg-nl-beige px-10 py-8 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-normal uppercase text-sm text-nl-purple-dark tracking-widest">Pretzel Gaudi 🥨</p>
          <h1 className="font-black text-3xl text-nl-black mt-0.5">Nest Checkout — Overview</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button
            onClick={onReset}
            className="font-semibold text-xs text-nl-black/30 hover:text-nl-black/60 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={copyLink}
            className="font-semibold text-sm px-4 py-2.5 rounded-xl border border-nl-black/20 text-nl-black/60 hover:text-nl-black hover:border-nl-black/40 transition-colors"
          >
            {copied ? '✓ Copied!' : '🔗 Share link'}
          </button>
          <button
            onClick={takeScreenshot}
            disabled={screenshotting}
            className="font-bold text-sm px-6 py-2.5 rounded-xl bg-nl-black text-nl-white hover:bg-nl-purple-dark transition-colors disabled:opacity-50"
          >
            {screenshotting ? 'Capturing...' : '📸 Take Screenshot'}
          </button>
        </div>
      </div>

      {/* Participant chips */}
      <div className="flex flex-wrap gap-2">
        {submissions.map((s, i) => <PersonTag key={i} s={s} />)}
      </div>

      {/* Main content */}
      <div className="flex gap-10 items-start">

        {/* Mood Board */}
        <div className="shrink-0">
          <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">
            Mood Check
          </h2>
          <MoodBoard submissions={submissions} />
        </div>

        {/* Cards */}
        <div className="flex gap-6 flex-1 min-w-0">

          <Column title="Achievements">
            {submissions.map((s, i) =>
              s.wins.map((w, j) => <StickyNote key={`${i}-${j}`} text={w} s={s} />)
            )}
          </Column>

          <Column title="Learnings">
            {submissions.map((s, i) =>
              s.learnings.map((l, j) => <StickyNote key={`${i}-${j}`} text={l} s={s} />)
            )}
          </Column>

          <Column title="Rather A or B?">
            {submissions.map((s, i) => s.funAnswer && (
              <AOrBCard key={i} s={s} />
            ))}
          </Column>

          <Column title="Weekend Plans">
            {submissions.map((s, i) => s.weekend && (
              <StickyNote key={i} text={s.weekend} s={s} />
            ))}
          </Column>

        </div>
      </div>
    </div>
  )
}
