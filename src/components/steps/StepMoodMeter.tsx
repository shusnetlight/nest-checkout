import { useState, useRef } from 'react'

export interface MoodSelection {
  x: number    // percentage 0–100 (left = unpleasant, right = pleasant)
  y: number    // percentage 0–100 (top = high energy, bottom = low energy)
  label: string
}

interface PlacedEmoji {
  emoji: string
  name: string
  x: number
  y: number
}

interface Props {
  emoji: string
  name: string
  selected: MoodSelection | null
  onSelect: (s: MoodSelection) => void
  others?: PlacedEmoji[]
}

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

function labelAt(xPct: number, yPct: number): string {
  const col = Math.min(5, Math.floor((xPct / 100) * 6))
  const row = Math.min(5, Math.floor((yPct / 100) * 6))
  return GRID[row][col]
}

export default function StepMoodMeter({ emoji, name, selected, onSelect, others = [] }: Props) {
  const boardRef = useRef<HTMLDivElement>(null)
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null)

  function getBoardCoords(e: React.MouseEvent) {
    const rect = boardRef.current!.getBoundingClientRect()
    return {
      px: e.clientX - rect.left,
      py: e.clientY - rect.top,
      xPct: ((e.clientX - rect.left) / rect.width) * 100,
      yPct: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    const { px, py } = getBoardCoords(e)
    setCursor({ x: px, y: py })
  }

  function handleClick(e: React.MouseEvent) {
    const { xPct, yPct } = getBoardCoords(e)
    onSelect({ x: xPct, y: yPct, label: labelAt(xPct, yPct) })
  }

  const allPlaced: PlacedEmoji[] = [
    ...others,
    ...(selected ? [{ emoji, name, x: selected.x, y: selected.y }] : []),
  ]

  const BOARD_SIZE = 420

  return (
    <div className="flex flex-col gap-3 animate-fade-up items-start">

      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50 pb-3">
        How are you feeling? Click to place yourself.
      </label>

      <div
        className="grid gap-x-3 gap-y-2 pr-2 pb-2"
        style={{ gridTemplateColumns: `auto ${BOARD_SIZE}px`, width: 'fit-content' }}
      >
        {/* Y-axis — width follows label text */}
        <div
          className="flex flex-col items-center justify-between shrink-0 w-fit"
          style={{ height: BOARD_SIZE }}
        >
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight whitespace-nowrap">HIGH<br/>ENERGY</span>
          <div className="flex flex-col items-center flex-1 justify-center gap-1 py-1 min-h-0 w-full">
            <span className="text-lg font-bold text-nl-black/50 leading-none">↑</span>
            <div className="flex-1 w-px bg-nl-black/30 min-h-0" />
            <span className="text-lg font-bold text-nl-black/50 leading-none">↓</span>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight whitespace-nowrap">LOW<br/>ENERGY</span>
        </div>

        {/* Board */}
        <div
          ref={boardRef}
          className="relative cursor-none select-none rounded-xl overflow-hidden shrink-0"
          style={{ width: BOARD_SIZE, height: BOARD_SIZE }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setCursor(null)}
          onClick={handleClick}
        >
          {/* Grid background */}
          <div className="grid grid-cols-6 gap-px bg-white/40 w-full h-full">
            {GRID.map((row, rIdx) =>
              row.map((label, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{ backgroundColor: cellColor(rIdx, cIdx) }}
                  className="flex items-center justify-center"
                >
                  <span className="text-[9px] font-bold text-nl-black/70 text-center leading-tight select-none px-0.5">
                    {label}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Placed emojis */}
          {allPlaced.map((p, i) => (
            <div
              key={i}
              className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-base border-2 border-nl-purple">
                {p.emoji}
              </div>
            </div>
          ))}

          {/* Custom emoji cursor */}
          {cursor && (
            <div
              className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 transition-none"
              style={{ left: cursor.x, top: cursor.y }}
            >
              <div className="w-8 h-8 rounded-full bg-white/80 shadow-lg flex items-center justify-center text-base border-2 border-nl-purple/50 opacity-80">
                {emoji}
              </div>
            </div>
          )}
        </div>

        {/* X-axis — second column, aligned with board */}
        <div />
        <div className="flex items-center gap-2 pt-3" style={{ width: BOARD_SIZE }}>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Unpleasant</span>
          <div className="flex items-center flex-1 gap-1">
            <span className="text-lg font-bold text-nl-black/50 leading-none">←</span>
            <div className="flex-1 h-px bg-nl-black/30" />
            <span className="text-lg font-bold text-nl-black/50 leading-none">→</span>
          </div>
          <span className="font-black text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Pleasant</span>
        </div>
      </div>

    </div>
  )
}
