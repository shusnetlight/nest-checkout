export interface Song {
  id: string
  title: string
  artist: string
  emoji: string
  ytId: string
}

export const ALL_SONGS: Song[] = [
  { id: 'que-pasa',       title: 'Que pasa',                    artist: 'Aymo',          emoji: '🎵', ytId: 'iTD4lWuEKrE' },
  { id: 'midnight-city',  title: 'Midnight City',               artist: 'M83',            emoji: '🌃', ytId: 'dX3k_QDnzHE' },
  { id: 'less-i-know',    title: 'The Less I Know The Better',  artist: 'Tame Impala',    emoji: '🌀', ytId: '2SUwOgmvzK4' },
  { id: 'electric-feel',  title: 'Electric Feel',               artist: 'MGMT',           emoji: '⚡', ytId: 'MmZexg8sxyk' },
  { id: 'day-n-nite',     title: "Day 'N' Nite",                artist: 'Kid Cudi',       emoji: '🌙', ytId: 'VrDfSZ_6f4U' },
  { id: 'feel-good-inc',  title: 'Feel Good Inc.',              artist: 'Gorillaz',       emoji: '🎮', ytId: 'HyHNuVaZJ-k' },
  { id: 'heat-waves',     title: 'Heat Waves',                  artist: 'Glass Animals',  emoji: '🌊', ytId: 'mRD0-GxqHVo' },
  { id: 'nightcall',      title: 'Nightcall',                   artist: 'Kavinsky',       emoji: '🚗', ytId: 'MV_3Dpw-BRY' },
]

// Deterministic seeded shuffle — same sessionId always returns same 3 songs
export function getSessionSongs(sessionId: string): Song[] {
  let hash = 0
  for (const c of sessionId) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff
  const shuffled = [...ALL_SONGS]
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 1664525 + 1013904223) & 0xffffffff
    const j = Math.abs(hash) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, 3)
}
