import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const PRETZELS = [
  { x:  8, y: 10, size: 140, rot: -15 },
  { x: 85, y:  8, size: 160, rot:  20 },
  { x:  5, y: 70, size: 130, rot: -30 },
  { x: 88, y: 75, size: 150, rot:  12 },
  { x: 47, y:  4, size: 120, rot:   5 },
  { x: 53, y: 88, size: 140, rot: -20 },
  { x: 22, y: 50, size: 130, rot:  25 },
  { x: 76, y: 52, size: 155, rot: -10 },
  { x: 35, y: 28, size: 115, rot:  15 },
  { x: 65, y: 68, size: 145, rot:  -5 },
]

const MAX_DIST = 320
const MAX_OPACITY = 0.25

export default function PretzelBackground() {
  const [mouse, setMouse] = useState({ x: -9999, y: -9999 })
  const [win, setWin] = useState({ w: window.innerWidth, h: window.innerHeight })

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY })
    const onResize = () => setWin({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('mousemove', onMove)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {PRETZELS.map((p, i) => {
        const cx = (p.x / 100) * win.w
        const cy = (p.y / 100) * win.h
        const dist = Math.hypot(mouse.x - cx, mouse.y - cy)
        const opacity = dist < MAX_DIST
          ? (1 - dist / MAX_DIST) * MAX_OPACITY
          : 0

        return (
          <motion.div
            key={i}
            animate={{ opacity }}
            transition={{ type: 'tween', duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              top: `${p.y}%`,
              fontSize: p.size,
              rotate: p.rot,
              x: '-50%',
              y: '-50%',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            🥨
          </motion.div>
        )
      })}
    </div>
  )
}
