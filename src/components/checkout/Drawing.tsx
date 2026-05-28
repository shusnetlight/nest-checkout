import { useRef, useState, useEffect } from 'react'

export interface DrawingStroke {
  color: string
  width: number
  points: { x: number; y: number }[]
}

const CANVAS_W = 400
const CANVAS_H = 260

const PALETTE = [
  '#6664F1', // purple
  '#EFD500', // yellow
  '#00AADF', // blue
  '#E166D5', // pink
  '#32DF19', // green
  '#FF8C00', // orange
  '#000000', // black
]

const WIDTHS = [3, 7, 16]

export function renderStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: DrawingStroke[],
  w: number,
  h: number,
) {
  for (const stroke of strokes) {
    if (stroke.points.length < 2) continue
    ctx.beginPath()
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.moveTo(stroke.points[0].x * w, stroke.points[0].y * h)
    for (const pt of stroke.points.slice(1)) {
      ctx.lineTo(pt.x * w, pt.y * h)
    }
    ctx.stroke()
  }
}

interface Props {
  strokes: DrawingStroke[]
  onChange: (strokes: DrawingStroke[]) => void
}

export default function Drawing({ strokes, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState(PALETTE[0])
  const [width, setWidth] = useState(WIDTHS[0])
  const drawing = useRef(false)
  const currentPoints = useRef<{ x: number; y: number }[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
    renderStrokes(ctx, strokes, CANVAS_W, CANVAS_H)
  }, [strokes])

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const rect = canvasRef.current!.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    }
  }

  function onStart(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    drawing.current = true
    currentPoints.current = [getPos(e)]
  }

  function onMove(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault()
    if (!drawing.current) return
    const pos = getPos(e)
    currentPoints.current.push(pos)
    const ctx = canvasRef.current!.getContext('2d')!
    const pts = currentPoints.current
    if (pts.length >= 2) {
      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(pts[pts.length - 2].x * CANVAS_W, pts[pts.length - 2].y * CANVAS_H)
      ctx.lineTo(pts[pts.length - 1].x * CANVAS_W, pts[pts.length - 1].y * CANVAS_H)
      ctx.stroke()
    }
  }

  function onEnd() {
    if (!drawing.current) return
    drawing.current = false
    if (currentPoints.current.length > 1) {
      onChange([...strokes, { color, width, points: currentPoints.current }])
    }
    currentPoints.current = []
  }

  return (
    <div className="flex flex-col gap-4 animate-fade-up">
      <p className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        Leave your mark on this week's team canvas.
      </p>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-xl border border-nl-black/10 bg-white w-full cursor-crosshair touch-none"
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />

      <div className="flex items-center justify-between">
        {/* Color palette */}
        <div className="flex gap-2">
          {PALETTE.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="w-6 h-6 rounded-full border-2 cursor-pointer transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? '#000' : 'transparent',
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                boxShadow: c === '#FFFFFF' ? 'inset 0 0 0 1px #00000020' : undefined,
              }}
            />
          ))}
        </div>

        {/* Brush sizes */}
        <div className="flex items-center gap-1">
          {WIDTHS.map(w => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ backgroundColor: width === w ? '#00000012' : 'transparent' }}
            >
              <div className="rounded-full bg-nl-black" style={{ width: w + 2, height: w + 2 }} />
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onChange(strokes.slice(0, -1))}
            disabled={strokes.length === 0}
            className="text-xs font-semibold text-nl-black/40 hover:text-nl-black/70 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
          >
            Undo
          </button>
          <button
            onClick={() => onChange([])}
            disabled={strokes.length === 0}
            className="text-xs font-semibold text-nl-black/40 hover:text-nl-black/70 disabled:opacity-30 transition-colors cursor-pointer disabled:cursor-default"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
