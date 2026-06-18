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

export default function MoodMeter({ emoji, name, selected, onSelect, others = [] }: Props) {
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

  return (
    <div className="flex flex-col gap-3 animate-fade-up w-full">

      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50 pb-3">
        How are you feeling? Tap to place yourself.
      </label>

      <div className="flex gap-2 sm:gap-3 w-full">
        {/* Y-axis */}
        <div className="flex flex-col items-center justify-between shrink-0 w-8 sm:w-10 self-stretch">
          <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight whitespace-nowrap">HIGH<br/>ENERGY</span>
          <div className="flex flex-col items-center flex-1 justify-center gap-1 py-1 min-h-0 w-full">
            <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">↑</span>
            <div className="flex-1 w-px bg-nl-black/30 min-h-0" />
            <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">↓</span>
          </div>
          <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 text-center leading-tight whitespace-nowrap">LOW<br/>ENERGY</span>
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* Board — fills available width, square via aspect-ratio */}
          <div
            ref={boardRef}
            className="relative cursor-crosshair select-none rounded-xl overflow-hidden w-full"
            style={{ aspectRatio: '1 / 1' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setCursor(null)}
            onClick={handleClick}
            onTouchStart={e => {
              const touch = e.touches[0]
              const rect = boardRef.current!.getBoundingClientRect()
              const xPct = ((touch.clientX - rect.left) / rect.width) * 100
              const yPct = ((touch.clientY - rect.top) / rect.height) * 100
              onSelect({ x: xPct, y: yPct, label: labelAt(xPct, yPct) })
            }}
          >
            <div className="grid grid-cols-6 gap-px bg-white/40 w-full h-full">
              {GRID.map((row, rIdx) =>
                row.map((label, cIdx) => (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    style={{ backgroundColor: cellColor(rIdx, cIdx) }}
                    className="flex items-center justify-center"
                  >
                    <span className="text-[7px] sm:text-[9px] font-bold text-nl-black/70 text-center leading-tight select-none px-0.5">
                      {label}
                    </span>
                  </div>
                ))
              )}
            </div>

            {allPlaced.map((p, i) => (
              <div
                key={i}
                className="absolute pointer-events-none z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white shadow-md flex items-center justify-center text-sm sm:text-base border-2 border-nl-purple">
                  {p.emoji}
                </div>
              </div>
            ))}

            {cursor && (
              <div
                className="absolute pointer-events-none z-20 -translate-x-1/2 -translate-y-1/2 transition-none"
                style={{ left: cursor.x, top: cursor.y }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 shadow-lg flex items-center justify-center text-sm sm:text-base border-2 border-nl-purple/50 opacity-80">
                  {emoji}
                </div>
              </div>
            )}
          </div>

          {/* X-axis */}
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Unpleasant</span>
            <div className="flex items-center flex-1 gap-1">
              <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">←</span>
              <div className="flex-1 h-px bg-nl-black/30" />
              <span className="text-base sm:text-lg font-bold text-nl-black/50 leading-none">→</span>
            </div>
            <span className="font-black text-[8px] sm:text-[10px] uppercase tracking-widest text-nl-black/60 shrink-0">Pleasant</span>
          </div>
        </div>
      </div>

    </div>
  )
}
