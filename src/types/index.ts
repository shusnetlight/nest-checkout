import type { MoodSelection } from '../components/checkout/MoodMeter'
import type { FunAnswer } from '../components/checkout/FunQuestion'
import type { DrawingStroke } from '../components/checkout/Drawing'

export interface Draft {
  name: string
  emoji: string
  mood: MoodSelection | null
  wins: string[]
  learnings: string[]
  funAnswer: FunAnswer | null
  weekend: string
  drawing: DrawingStroke[]
  song_choice?: string
}

export interface Submission extends Draft {
  colorIdx: number
}
