import { useState, useRef, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { toPng } from 'html-to-image'
import type { Draft } from '../App'
import { renderStrokes } from './checkout/Drawing'
import { supabase } from '../lib/supabase'

export interface Submission extends Draft {
  colorIdx: number
}

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

const BOARD = 360

function MoodBoard({ submissions }: { submissions: Submission[] }) {
  return (
    <div className="flex flex-col gap-0">
      <div className="flex gap-3 items-stretch">
        <div className="flex flex-col items-center justify-between shrink-0 w-10" style={{ height: BOARD }}>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">HIGH<br/>ENERGY</span>
          <div className="flex flex-col items-center flex-1 justify-center gap-1 py-1">
            <span className="text-lg font-bold text-nl-black/50 leading-none">↑</span>
            <div className="flex-1 w-px bg-nl-black/30" />
            <span className="text-lg font-bold text-nl-black/50 leading-none">↓</span>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight">LOW<br/>ENERGY</span>
        </div>
        <div className="relative rounded-xl overflow-hidden shrink-0" style={{ width: BOARD, height: BOARD }}>
          <div className="grid grid-cols-6 gap-px bg-white/40 w-full h-full">
            {GRID.map((row, rIdx) =>
              row.map((label, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{ backgroundColor: cellColor(rIdx, cIdx) }}
                  className="relative flex items-center justify-center group"
                >
                  <span className="relative text-[9px] font-bold text-center leading-tight px-0.5 select-none text-nl-black/70 group-hover:text-nl-black group-hover:bg-white group-hover:rounded-sm group-hover:px-1 group-hover:z-[100] transition-colors">
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
              >
                {s.emoji}
              </div>
            </div>
          ))}
        </div>
      </div>
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
    <div className="flex flex-col gap-3">
      <div className="rounded-xl overflow-hidden border border-nl-black/10" style={{ width: CANVAS_W, height: CANVAS_H }}>
        <img src={mainDataUrl} style={{ width: CANVAS_W, height: CANVAS_H, display: 'block' }} />
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

// ── Reactions ─────────────────────────────────────────────────────────────────

type ReactionType = 'thumbsup' | 'heart' | 'nest'
type ReactionsMap = Record<string, string[]> // `${cardKey}__${type}` → reactorId[]

function getReactorId() {
  let id = localStorage.getItem('nest-reactor-id')
  if (!id) { id = Math.random().toString(36).slice(2, 12); localStorage.setItem('nest-reactor-id', id) }
  return id
}

function useReactions(sessionId: string) {
  const reactorId = useRef(getReactorId())
  const [reactions, setReactions] = useState<ReactionsMap>({})
  const reactionsRef = useRef(reactions)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  reactionsRef.current = reactions

  useEffect(() => {
    // Remove any existing channel first (handles React Strict Mode double-invoke)
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channel = supabase
      .channel(`reactions-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reactions', filter: `session_id=eq.${sessionId}` }, payload => {
        if (payload.new.reactor_id === reactorId.current) return
        const k = `${payload.new.submission_key}__${payload.new.type}`
        setReactions(prev => ({ ...prev, [k]: [...(prev[k] ?? []), payload.new.reactor_id] }))
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'reactions', filter: `session_id=eq.${sessionId}` }, payload => {
        if (payload.old.reactor_id === reactorId.current) return
        const k = `${payload.old.submission_key}__${payload.old.type}`
        setReactions(prev => ({ ...prev, [k]: (prev[k] ?? []).filter(id => id !== payload.old.reactor_id) }))
      })
      .subscribe()
    channelRef.current = channel

    supabase
      .from('reactions')
      .select('submission_key, reactor_id, type')
      .eq('session_id', sessionId)
      .then(({ data, error }) => {
        if (error) { console.error('[reactions] load error:', error); return }
        if (!data) return
        const map: ReactionsMap = {}
        for (const row of data) {
          const k = `${row.submission_key}__${row.type}`
          map[k] = [...(map[k] ?? []), row.reactor_id]
        }
        setReactions(map)
      })

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [sessionId])

  const toggle = useCallback(async (cardKey: string, type: ReactionType) => {
    const k = `${cardKey}__${type}`
    const hasReacted = reactionsRef.current[k]?.includes(reactorId.current) ?? false

    setReactions(prev => ({
      ...prev,
      [k]: hasReacted
        ? (prev[k] ?? []).filter(id => id !== reactorId.current)
        : [...(prev[k] ?? []), reactorId.current],
    }))

    if (hasReacted) {
      const { error } = await supabase.from('reactions').delete()
        .eq('session_id', sessionId)
        .eq('submission_key', cardKey)
        .eq('reactor_id', reactorId.current)
        .eq('type', type)
      if (error) console.error('[reactions] delete error:', error)
    } else {
      const { error } = await supabase.from('reactions').insert({
        session_id: sessionId,
        submission_key: cardKey,
        reactor_id: reactorId.current,
        type,
      })
      if (error) console.error('[reactions] insert error:', error)
    }
  }, [sessionId])

  return { reactions, reactorId: reactorId.current, toggle }
}

// ── Reactable Card Wrapper ────────────────────────────────────────────────────

function NestEmojiIcon({ emoji, size = 20 }: { emoji: string; size?: number }) {
  if (emoji.startsWith('/'))
    return <img src={emoji} style={{ width: size, height: size }} className="object-contain" />
  return <span style={{ fontSize: size, lineHeight: 1 }}>{emoji}</span>
}

function ReactableCard({ cardKey, reactions, reactorId, nestEmoji, onToggle, children }: {
  cardKey: string
  reactions: ReactionsMap
  reactorId: string
  nestEmoji: string
  onToggle: (cardKey: string, type: ReactionType) => void
  children: (badges: React.ReactNode) => React.ReactNode
}) {
  const [hovering, setHovering] = useState(false)

  const types: { type: ReactionType; emoji: string }[] = [
    { type: 'thumbsup', emoji: '👍' },
    { type: 'heart',    emoji: '❤️' },
    { type: 'nest',     emoji: nestEmoji },
  ]

  const activeTypes = types.filter(t => (reactions[`${cardKey}__${t.type}`]?.length ?? 0) > 0)

  const badges = activeTypes.length > 0 ? (
    <div className="flex gap-1 mt-2 flex-wrap">
      {activeTypes.map(({ type, emoji }) => {
        const count = reactions[`${cardKey}__${type}`]?.length ?? 0
        const hasOwn = reactions[`${cardKey}__${type}`]?.includes(reactorId) ?? false
        return (
          <button
            key={type}
            onClick={e => { e.stopPropagation(); onToggle(cardKey, type) }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer
              ${hasOwn
                ? 'bg-white/60 border-nl-black/25 text-nl-black'
                : 'bg-white/30 border-nl-black/15 text-nl-black/50 hover:border-nl-black/30'
              }`}
          >
            <NestEmojiIcon emoji={emoji} size={13} />
            <span>{count}</span>
          </button>
        )
      })}
    </div>
  ) : null

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Hover toolbar */}
      {hovering && (
        <div className="absolute -top-10 right-0 z-20 flex items-center gap-0.5 bg-white rounded-2xl shadow-lg border border-nl-black/10 px-2 py-1.5">
          {types.map(({ type, emoji }) => {
            const hasOwn = reactions[`${cardKey}__${type}`]?.includes(reactorId) ?? false
            return (
              <button
                key={type}
                onClick={e => { e.stopPropagation(); onToggle(cardKey, type) }}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer
                  ${hasOwn ? 'bg-nl-purple/15 scale-110' : 'hover:bg-nl-black/6 hover:scale-110'}`}
              >
                <NestEmojiIcon emoji={emoji} size={18} />
              </button>
            )
          })}
        </div>
      )}

      {children(badges)}
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

export default function OverviewBoard({ submissions, sessionId, nestName, nestEmoji, onAddPerson: _onAddPerson, onRestart }: Props) {
  const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')
  const shareUrl = `${window.location.origin}?nest=${toSlug(nestName)}&session=${sessionId}&view=overview`
  const [copied, setCopied] = useState(false)
  const [screenshotting, setScreenshotting] = useState(false)
  const [screenshotMenu, setScreenshotMenu] = useState(false)
  const [visibleSubmissions, setVisibleSubmissions] = useState(submissions)
  const boardRef = useRef<HTMLDivElement>(null)
  // const { reactions, reactorId, toggle } = useReactions(sessionId)

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
    <div ref={boardRef} className="min-h-screen bg-nl-beige px-10 py-8 flex flex-col gap-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-normal uppercase text-sm text-nl-purple-dark tracking-widest">{nestName}</p>
          <h1 className="font-black text-3xl text-nl-black mt-0.5">Nest Checkout — Overview</h1>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={onRestart} className="font-semibold text-xs text-nl-black/30 hover:text-nl-black/60 transition-colors cursor-pointer">
            Restart
          </button>
          <button
            onClick={copyLink}
            className="font-semibold text-sm px-4 py-2.5 rounded-xl border border-nl-black/20 text-nl-black/60 hover:text-nl-black hover:border-nl-black/40 transition-colors cursor-pointer"
          >
            {copied ? '✓ Copied!' : '🔗 Share link'}
          </button>
          <div className="relative">
            <button
              onClick={() => setScreenshotMenu(v => !v)}
              disabled={screenshotting}
              className="font-bold text-sm px-6 py-2.5 rounded-xl bg-nl-black text-nl-white hover:bg-nl-purple-dark transition-colors disabled:opacity-50 cursor-pointer"
            >
              {screenshotting ? 'Capturing...' : '📸 Screenshot'}
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
      <div className="flex gap-10 items-start">

        <div className="shrink-0 flex flex-col gap-12">
          <div>
            <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">Mood Check</h2>
            <MoodBoard submissions={visibleSubmissions} />
          </div>
          <div>
            <h2 className="font-black text-xs uppercase tracking-widest text-nl-black/40 border-b border-nl-black/10 pb-2 mb-4">Team Canvas</h2>
            <TeamCanvas submissions={visibleSubmissions} />
          </div>
        </div>

        <div className="flex gap-6 flex-1 min-w-0">

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
  )
}
