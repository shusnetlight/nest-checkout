export interface Song {
  id: string
  title: string
  artist: string
  emoji: string
  ytId: string
}

export const ALL_SONGS: Song[] = [
  { id: 'que-pasa',         title: 'Que pasa',                    artist: 'Aymo',                                emoji: '🎵',  ytId: 'iTD4lWuEKrE' },
  { id: 'midnight-city',    title: 'Midnight City',               artist: 'M83',                                 emoji: '🌃',  ytId: 'dX3k_QDnzHE' },
  { id: 'less-i-know',      title: 'The Less I Know The Better',  artist: 'Tame Impala',                         emoji: '🌀',  ytId: '2SUwOgmvzK4' },
  { id: 'electric-feel',    title: 'Electric Feel',               artist: 'MGMT',                                emoji: '⚡',   ytId: 'MmZexg8sxyk' },
  { id: 'day-n-nite',       title: "Day 'N' Nite",                artist: 'Kid Cudi',                            emoji: '🌙',  ytId: 'VrDfSZ_6f4U' },
  { id: 'feel-good-inc',    title: 'Feel Good Inc.',              artist: 'Gorillaz',                            emoji: '🎮',  ytId: 'HyHNuVaZJ-k' },
  { id: 'heat-waves',       title: 'Heat Waves',                  artist: 'Glass Animals',                       emoji: '🌊',  ytId: 'mRD0-GxqHVo' },
  { id: 'nightcall',        title: 'Nightcall',                   artist: 'Kavinsky',                            emoji: '🚗',  ytId: 'MV_3Dpw-BRY' },
  { id: 'here-comes-sun',   title: 'Here Comes The Sun',          artist: 'The Beatles',                         emoji: '☀️',  ytId: 'KQetemT1sWc' },
  { id: 'wouldnt-nice',     title: "Wouldn't It Be Nice",         artist: 'The Beach Boys',                      emoji: '🌸',  ytId: '5lP8BZcyoEQ' },
  { id: 'espresso',         title: 'Espresso',                    artist: 'Sabrina Carpenter',                   emoji: '☕',   ytId: 'eVli-tstM5E' },
  { id: 'miles-away',       title: 'Miles Away',                  artist: 'Ofenbach',                            emoji: '✈️',  ytId: 'FUo-g8GW6Z8' },
  { id: 'i-had-some-help',  title: 'I Had Some Help',             artist: 'Post Malone ft. Morgan Wallen',       emoji: '🤠',  ytId: '4QIZE708gJ4' },
  { id: 'sunroof',          title: 'Sunroof',                     artist: 'Nicky Youre & dazy',                  emoji: '🌞',  ytId: 'G5xSLbYMr-I' },
  { id: 'messy',            title: 'Messy',                       artist: 'Lola Young',                           emoji: '🌪️',  ytId: 'AHI7JjJlpYo' },
  { id: 'following-sun',    title: 'Following The Sun',           artist: 'SUPER-Hi x NEEKA',                    emoji: '🌅',  ytId: 'uZsY4S4ckMU' },
  { id: 'i-run',            title: 'I RUN',                       artist: 'HAVEN.',                               emoji: '🏃',   ytId: 'hTHmk4_HnV4' },
  { id: 'black-friday',     title: 'Black Friday',                artist: 'Lost Frequencies & Tom Odell',         emoji: '🖤',  ytId: 'vRLQQJtKEbs' },
  { id: 'reality',          title: 'Reality',                     artist: 'Lost Frequencies',                     emoji: '🌊',  ytId: '_uC_hmA64ns' },
  { id: 'bella-ciao',       title: 'Bella Ciao (HUGEL Remix)',    artist: 'El Profesor',                          emoji: '🎭',  ytId: 'jhgJV0Pg54Y' },
  { id: 'ordinary',         title: 'Ordinary',                    artist: 'Alex Warren',                           emoji: '✨',   ytId: 'u2ah9tWTkmk' },
  { id: 'golden',           title: 'Golden',                      artist: 'KPop Demon Hunters',                    emoji: '🌟',  ytId: 'yebNIHKAC4A' },
  { id: 'king-of-my-castle',title: 'King Of My Castle',           artist: 'Wamdue Project',                        emoji: '🏰',  ytId: 'DXSyQjppqG0' },
  { id: 'ocean-drive',      title: 'Ocean Drive',                 artist: 'Duke Dumont',                           emoji: '🚙',  ytId: 'KDxJlW6cxRk' },
  { id: 'stolen-dance',     title: 'Stolen Dance',                artist: 'Milky Chance',                          emoji: '💃',  ytId: 'YMdeOS-taQQ' },
  { id: 'we-are-the-people',title: 'We Are The People',           artist: 'Empire of the Sun',                     emoji: '🌍',  ytId: 'hN5X4kGhAtU' },
  { id: 'lose-control',     title: 'Lose Control',                artist: 'MEDUZA, Becky Hill, Goodboys',          emoji: '💃',  ytId: '-3P2USPFDcE' },
  { id: 'miracle',          title: 'Miracle',                     artist: 'Calvin Harris, Ellie Goulding',          emoji: '✨',   ytId: '961v0E3b01g' },
  { id: 'intoxicated',      title: 'Intoxicated',                 artist: 'Martin Solveig & GTA',                   emoji: '🍸',   ytId: '94Rq2TX0wj4' },
  { id: 'hypnotized',       title: 'Hypnotized',                  artist: 'Purple Disco Machine, Sophie and the Giants', emoji: '🌀',  ytId: 'UbYQErtM9Zk' },
  { id: 'cola',             title: 'Cola',                        artist: 'CamelPhat & Elderbrook',                 emoji: '🥤',  ytId: 'qke-jOUqSXU' },
  { id: 'dopamine',         title: 'Dopamine',                    artist: 'Purple Disco Machine, Eyelar',           emoji: '🪩',  ytId: 'EGGXBbst5Lo' },
  { id: 'happy',            title: 'Happy',                       artist: 'Pharrell Williams',                      emoji: '😊',  ytId: 'ZbZSe6N_BXs' },
  { id: 'get-lucky',        title: 'Get Lucky',                   artist: 'Daft Punk ft. Pharrell Williams',        emoji: '🍀',  ytId: '5NV6Rdv1a3I' },
  { id: 'uptown-funk',      title: 'Uptown Funk',                 artist: 'Mark Ronson ft. Bruno Mars',             emoji: '🕺',  ytId: 'OPf0YbXqDm0' },
  { id: 'pumped-up-kicks',  title: 'Pumped Up Kicks',             artist: 'Foster The People',                      emoji: '👟',  ytId: 'SDTZ7iX4vTQ' },
  { id: 'levitating',       title: 'Levitating',                  artist: 'Dua Lipa',                               emoji: '🪐',  ytId: 'TUVcZfQe-Kw' },
  { id: 'as-it-was',        title: 'As It Was',                   artist: 'Harry Styles',                           emoji: '🎈',  ytId: 'H5v3kku4y6Q' },
  { id: 'good-as-hell',     title: 'Good As Hell',                artist: 'Lizzo',                                  emoji: '💅',  ytId: 'SmbmeOgWsqE' },
  { id: 'wake-me-up',       title: 'Wake Me Up',                  artist: 'Avicii',                                 emoji: '⏰',  ytId: 'IcrbM1l_BoI' },
  { id: 'levels',           title: 'Levels',                      artist: 'Avicii',                                 emoji: '🎚️', ytId: '_ovdm2yX4MA' },
  { id: 'sugar',            title: 'Sugar',                       artist: 'Robin Schulz ft. Francesco Yates',       emoji: '🍬',  ytId: 'bvC_0foemLY' },
  { id: 'firestone',        title: 'Firestone',                   artist: 'Kygo ft. Conrad Sewell',                 emoji: '🔥',  ytId: '9Sc-ir2UwGU' },
  { id: 'latch',            title: 'Latch',                       artist: 'Disclosure ft. Sam Smith',               emoji: '🔗',  ytId: '93ASUImTedo' },
  { id: 'blinding-lights',  title: 'Blinding Lights',             artist: 'The Weeknd',                             emoji: '💡',  ytId: '4NRXx6U8ABQ' },
  { id: 'september',        title: 'September',                   artist: 'Earth, Wind & Fire',                     emoji: '🍂',  ytId: 'Gs069dndIYk' },
  { id: 'dancing-queen',    title: 'Dancing Queen',               artist: 'ABBA',                                   emoji: '👑',  ytId: 'xFrGuyw1V8s' },
  { id: 'shut-up-and-dance',title: 'Shut Up and Dance',           artist: 'WALK THE MOON',                          emoji: '🌕',  ytId: '6JCLY0Rlx6Q' },
  { id: 'walking-on-sunshine', title: 'Walking On Sunshine',      artist: 'Katrina & The Waves',                    emoji: '🌻',  ytId: 'iPUmE-tne5U' },
  { id: 'a-punk',           title: 'A-Punk',                      artist: 'Vampire Weekend',                        emoji: '🎸',  ytId: '_XC2mqcMMGQ' },
  { id: 'waves',            title: 'Waves (Robin Schulz Remix)',  artist: 'Mr. Probz',                              emoji: '🌊',  ytId: 'pUjE9H8QlA4' },
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
