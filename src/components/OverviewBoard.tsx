import { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import type { Submission } from '../types'
import { renderStrokes } from './checkout/Drawing'
import { toSlug } from '../utils/session'

export type { Submission }

const COLORS = [
  { bg: '#E8E4FF', border: '#6664F1' },
  { bg: '#FFF9CC', border: '#EFD500' },
  { bg: '#C2F9FF', border: '#00AADF' },
  { bg: '#FFD0FF', border: '#E166D5' },
  { bg: '#C8FFFB', border: '#32DF19' },
  { bg: '#FFE4CC', border: '#FF8C00' },
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

function MoodBoard({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="flex flex-col gap-0 w-full">
      <div className="flex gap-2 sm:gap-3 items-stretch w-full">
        {/* Y-axis */}
        <div className="flex flex-col items-center justify-between shrink-0 w-8 sm:w-10 self-stretch">
          <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">HIGH<br/>ENERGY</span>
          <div className="flex flex-col items-center flex-1 justify-center gap-1 py-1">
            <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">↑</span>
            <div className="flex-1 w-px bg-nl-black/30" />
            <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">↓</span>
          </div>
          <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">LOW<br/>ENERGY</span>
        </div>
        {/* Board — fluid width, square via aspect-ratio */}
        <div className="relative rounded-xl overflow-hidden flex-1" style={{ aspectRatio: '1 / 1' }}>
          <div className="grid grid-cols-6 gap-px bg-white/40 w-full h-full">
            {GRID.map((row, rIdx) =>
              row.map((label, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{ backgroundColor: cellColor(rIdx, cIdx) }}
                  className="relative flex items-center justify-center group"
                >
                  <span className="relative text-[7px] sm:text-[9px] font-bold text-center leading-tight px-0.5 select-none text-nl-black/70 group-hover:text-nl-black group-hover:bg-white group-hover:rounded-sm group-hover:px-1 group-hover:z-[100] transition-colors">
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
                className="w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm sm:text-base shadow-md border-2"
                style={{ backgroundColor: colorOf(s.colorIdx).bg, borderColor: colorOf(s.colorIdx).border }}
              >
                {s.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* X-axis — offset matches Y-axis width */}
      <div className="flex items-center gap-1 sm:gap-2 mt-2 pt-2 sm:pt-3 pl-10 sm:pl-12">
        <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Unpleasant</span>
        <div className="flex items-center flex-1 gap-1">
          <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">←</span>
          <div className="flex-1 h-px bg-nl-black/30" />
          <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">→</span>
        </div>
        <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Pleasant</span>
      </div>
    </div>
  )
}

// ── Team Canvas ───────────────────────────────────────────────────────────────

const CANVAS_W = 360
const CANVAS_H = 240
const THUMB_W = 48
const THUMB_H = 32

function useCanvasDataUrl(submissions: Submission[], onlyIndex?: number) {
  const [dataUrl, setDataUrl] = useState('')
  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = CANVAS_W
    canvas.height = CANVAS_H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
    submissions.forEach((s, i) => {
      if (onlyIndex !== undefined && onlyIndex !== i) return
      if (s.drawing?.length) renderStrokes(ctx, s.drawing, CANVAS_W, CANVAS_H)
    })
    setDataUrl(canvas.toDataURL())
  }, [submissions, onlyIndex]) // eslint-disable-line
  return dataUrl
}

function Thumb({ label, dataUrl, isSelected, onClick }: {
  label: string; dataUrl: string; isSelected: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer shrink-0">
      <div
        className="rounded-md overflow-hidden border-2 transition-colors"
        style={{ borderColor: isSelected ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.08)', width: THUMB_W, height: THUMB_H }}
      >
        <img src={dataUrl} style={{ width: THUMB_W, height: THUMB_H, display: 'block' }} />
      </div>
      <span className="text-[9px] font-bold uppercase tracking-widest text-nl-black/40">{label}</span>
    </button>
  )
}

function IndividualThumb({ index, submissions, selected, onSelect }: {
  index: number; submissions: Submission[]; selected: number | 'all'; onSelect: (v: number | 'all') => void
}) {
  const dataUrl = useCanvasDataUrl(submissions, index)
  return (
    <Thumb
      label={`${index + 1}`}
      dataUrl={dataUrl}
      isSelected={selected === index}
      onClick={() => onSelect(selected === index ? 'all' : index)}
    />
  )
}

function TeamCanvas({ submissions }: { submissions: Submission[] }) {
  const [selected, setSelected] = useState<number | 'all'>('all')

  useEffect(() => {
    if (typeof selected === 'number' && selected >= submissions.length) setSelected('all')
  }, [submissions.length]) // eslint-disable-line

  const mainDataUrl = useCanvasDataUrl(submissions, selected === 'all' ? undefined : selected)
  const allThumbUrl  = useCanvasDataUrl(submissions)
  const withDrawings = submissions.filter(s => s.drawing?.length)

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="rounded-xl overflow-hidden border border-nl-black/10 w-full">
        <img src={mainDataUrl} className="w-full h-auto block" style={{ aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }} />
      </div>
      {withDrawings.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          <Thumb label="All" dataUrl={allThumbUrl} isSelected={selected === 'all'} onClick={() => setSelected('all')} />
          {submissions.map((s, i) => {
            if (!s.drawing?.length) return null
            return <IndividualThumb key={i} index={i} submissions={submissions} selected={selected} onSelect={setSelected} />
          })}
        </div>
      )}
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function AOrBCard({ s, footer }: { s: Submission; footer?: React.ReactNode }) {
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
          <div key={side} className="flex items-start gap-2">
            <span
              className="font-black text-[10px] uppercase tracking-widest mt-0.5 shrink-0 w-3"
              style={{ color: isChosen ? c.border : '#00000033' }}
            >
              {side.toUpperCase()}
            </span>
            <span className={`text-sm leading-snug ${isChosen ? 'font-bold text-nl-black' : 'font-normal text-nl-black/30'}`}>
              {side === 'a' ? a : b}
            </span>
          </div>
        )
      })}
      {footer}
    </div>
  )
}

function StickyNote({ text, s, footer }: { text: string; s: Submission; footer?: React.ReactNode }) {
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
      {footer}
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
  nestName: string
  nestEmoji: string
  onAddPerson: () => void
  onRestart: () => void
}

export default function OverviewBoard({ submissions, sessionId, nestName, nestEmoji: _nestEmoji, onAddPerson: _onAddPerson, onRestart }: Props) {
  const shareUrl = `${window.location.origin}?nest=${toSlug(nestName)}&session=${sessionId}&view=overview`
  const [copied, setCopied] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const [screenshotMenu, setScreenshotMenu] = useState(false)
  const [visibleSubmissions, setVisibleSubmissions] = useState(submissions)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setVisibleSubmissions(submissions) }, [submissions])

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function takeScreenshot(filter: 'all' | 'personal') {
    if (!boardRef.current) return
    setScreenshotMenu(false)

    const subs = filter === 'personal'
      ? (() => {
          const name = localStorage.getItem('nest-user-name')
          const emoji = localStorage.getItem('nest-user-emoji')
          return name && emoji ? submissions.filter(s => s.name === name && s.emoji === emoji) : submissions
        })()
      : submissions

    flushSync(() => { setVisibleSubmissions(subs); setScreenshotting(true) })

    // Wait for canvas useEffects to redraw after the submissions filter is applied
    await new Promise(resolve => setTimeout(resolve, 200))

    try {
      const dataUrl = await toPng(boardRef.current, { pixelRatio: 2, backgroundColor: '#FFF0E6' })
      const link = document.createElement('a')
      link.download = `nest-checkout-${sessionId}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } finally {
      flushSync(() => { setVisibleSubmissions(submissions); setScreenshotting(false) })
    }
  }

  return (
    <div ref={boardRef} className="min-h-screen bg-nl-beige px-4 sm:px-10 py-6 sm:py-8 flex flex-col gap-6 sm:gap-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        {/* Title — below action bar on mobile, left on desktop */}
        <div className="order-2 sm:order-1">
          <p className="font-normal uppercase text-sm text-nl-purple-dark tracking-widest">{nestName}</p>
          <h1 className="font-black text-2xl sm:text-3xl text-nl-black mt-0.5">Nest Checkout — Overview</h1>
        </div>
        {/* Action bar — top on mobile, right on desktop */}
        <div className="order-1 sm:order-2 flex items-center gap-2 sm:gap-3 shrink-0">
          <button onClick={onRestart} className="font-semibold text-sm text-nl-black/40 hover:text-nl-black/70 transition-colors cursor-pointer mr-auto sm:mr-0">
            ← Restart
          </button>
          <button
            onClick={copyLink}
            className="flex items-center gap-1 h-9 px-3 sm:px-4 rounded-xl border border-nl-black/15 hover:border-nl-black/30 text-nl-black/50 hover:text-nl-black text-sm font-semibold transition-colors cursor-pointer"
          >
            {copied ? '✓' : '🔗'}
            <span className="hidden sm:inline ml-0.5">{copied ? 'Copied!' : 'Share'}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setScreenshotMenu(v => !v)}
              disabled={screenshotting}
              className="flex items-center gap-1 h-9 px-3 sm:px-5 rounded-xl bg-nl-black text-nl-white hover:bg-nl-purple-dark text-sm font-bold transition-colors disabled:opacity-50 cursor-pointer"
            >
              📸<span className="hidden sm:inline ml-0.5">{screenshotting ? 'Capturing...' : 'Screenshot'}</span>
            </button>
            {screenshotMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setScreenshotMenu(false)} />
                <div className="absolute right-0 top-full mt-1.5 bg-white rounded-xl shadow-lg border border-nl-black/10 overflow-hidden z-50 min-w-[160px]">
                  <button
                    onClick={() => takeScreenshot('all')}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-nl-black hover:bg-nl-black/5 transition-colors cursor-pointer"
                  >
                    All entries
                  </button>
                  <button
                    onClick={() => takeScreenshot('personal')}
                    className="w-full text-left px-4 py-2.5 text-sm font-semibold text-nl-black hover:bg-nl-black/5 transition-colors cursor-pointer"
                  >
                    My entries
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      <div className="flex flex-wrap gap-2">
        {visibleSubmissions.map((s, i) => <PersonTag key={i} s={s} />)}
      </div>

      {/* Main */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">

        {/* Left: Mood (always) + Canvas (desktop only) */}
        <div className="w-full lg:w-[360px] lg:shrink-0 flex flex-col gap-8">
          <div>
            <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">Mood Check</h2>
            <MoodBoard submissions={visibleSubmissions} />
          </div>
          <div className="hidden lg:block">
            <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">Team Canvas</h2>
            <TeamCanvas submissions={visibleSubmissions} />
          </div>
        </div>

        {/* Right: content — 2 paired rows on mobile, single flex row on desktop */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 flex-1 min-w-0 w-full">

          {/* Row 1 on mobile: Achievements + Learnings */}
          <div className="grid grid-cols-2 lg:contents gap-4">
            <Column title="Achievements">
              {visibleSubmissions.map((s, i) =>
                s.wins.map((w, j) => (
                  <StickyNote key={`${i}-${j}`} text={w} s={s} />
                ))
              )}
            </Column>
            <Column title="Learnings">
              {visibleSubmissions.map((s, i) =>
                s.learnings.map((l, j) => (
                  <StickyNote key={`${i}-${j}`} text={l} s={s} />
                ))
              )}
            </Column>
          </div>

          {/* Row 2 on mobile: A or B + Weekend Plans */}
          <div className="grid grid-cols-2 lg:contents gap-4">
            <Column title="Rather A or B?">
              {visibleSubmissions.map((s, i) => s.funAnswer && (
                <AOrBCard key={i} s={s} />
              ))}
            </Column>
            <Column title="Weekend Plans">
              {visibleSubmissions.map((s, i) => s.weekend && (
                <StickyNote key={i} text={s.weekend} s={s} />
              ))}
            </Column>
          </div>

        </div>
      </div>

      {/* Team Canvas — mobile only, after content columns */}
      <div className="lg:hidden mt-4">
        <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">Team Canvas</h2>
        <TeamCanvas submissions={visibleSubmissions} />
      </div>
    </div>
  )
}
