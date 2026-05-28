export interface Song {
  id: string
  title: string
  artist: string
  emoji: string
  ytId: string
}

export const ALL_SONGS: Song[] = [
  { id: 'happy',          title: 'Happy',               artist: 'Pharrell Williams',  emoji: '☀️', ytId: 'ZbZSe6N_BXs' },
  { id: 'dont-stop',      title: "Don't Stop Me Now",   artist: 'Queen',              emoji: '🎸', ytId: 'HgzGwKwLmgM' },
  { id: 'uptown-funk',    title: 'Uptown Funk',          artist: 'Bruno Mars',         emoji: '🕺', ytId: 'OPf0YbXqDm0' },
  { id: 'shape-of-you',   title: 'Shape of You',         artist: 'Ed Sheeran',         emoji: '🎶', ytId: 'JGwWNGJdvx8' },
  { id: 'shake-it-off',   title: 'Shake It Off',         artist: 'Taylor Swift',       emoji: '✨', ytId: 'nfWlot6h_JM' },
  { id: 'dancing-queen',  title: 'Dancing Queen',        artist: 'ABBA',               emoji: '👑', ytId: 'xFrGuyw1V8s' },
  { id: 'bohemian',       title: 'Bohemian Rhapsody',    artist: 'Queen',              emoji: '🎭', ytId: 'fJ9rUzIMcZQ' },
  { id: 'good-as-hell',   title: 'Good as Hell',         artist: 'Lizzo',              emoji: '💪', ytId: 'SmbmeOgWsqE' },
  { id: 'cant-stop',      title: "Can't Stop the Feeling", artist: 'Justin Timberlake', emoji: '🌟', ytId: 'ru0K8uYEZWw' },
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
