import { useState, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
}

const MAX = 160

// ── Weather ────────────────────────────────────────────────────────────────────

interface WeatherDay {
  date: string
  code: number
  max: number
  min: number
}

function weatherEmoji(code: number) {
  if (code === 0)  return '☀️'
  if (code === 1)  return '🌤️'
  if (code === 2)  return '⛅'
  if (code === 3)  return '☁️'
  if (code <= 48)  return '🌫️'
  if (code <= 55)  return '🌦️'
  if (code <= 67)  return '🌧️'
  if (code <= 77)  return '❄️'
  if (code <= 82)  return '🌦️'
  if (code <= 86)  return '🌨️'
  return '⛈️'
}

function weatherLabel(code: number) {
  if (code === 0)  return 'Clear sky'
  if (code === 1)  return 'Mainly clear'
  if (code === 2)  return 'Partly cloudy'
  if (code === 3)  return 'Overcast'
  if (code <= 48)  return 'Foggy'
  if (code <= 55)  return 'Drizzle'
  if (code <= 67)  return 'Rain'
  if (code <= 77)  return 'Snow'
  if (code <= 82)  return 'Rain showers'
  if (code <= 86)  return 'Snow showers'
  return 'Thunderstorm'
}

const MUNICH = { lat: 48.1351, lon: 11.582, city: 'München' }

function useWeekendWeather() {
  const [saturday, setSaturday] = useState<WeatherDay | null>(null)
  const [sunday, setSunday]     = useState<WeatherDay | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${MUNICH.lat}&longitude=${MUNICH.lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Europe%2FBerlin&forecast_days=10`)
      .then(r => r.json())
      .then(w => {
        const dates: string[] = w.daily.time
        const codes: number[] = w.daily.weathercode
        const maxes: number[] = w.daily.temperature_2m_max
        const mins:  number[] = w.daily.temperature_2m_min

        let sat: WeatherDay | null = null
        let sun: WeatherDay | null = null
        for (let i = 0; i < dates.length; i++) {
          const day = new Date(dates[i] + 'T12:00:00').getDay()
          if (day === 6 && !sat) sat = { date: dates[i], code: codes[i], max: maxes[i], min: mins[i] }
          if (day === 0 && !sun) sun = { date: dates[i], code: codes[i], max: maxes[i], min: mins[i] }
          if (sat && sun) break
        }
        setSaturday(sat)
        setSunday(sun)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return { saturday, sunday, city: MUNICH.city, loading }
}

// ── Weather Card ───────────────────────────────────────────────────────────────

function WeatherWidget({ saturday, sunday, city }: { saturday: WeatherDay; sunday: WeatherDay; city: string }) {
  return (
    <div className="flex bg-nl-black/[0.04] rounded-2xl overflow-hidden">
      {/* Location panel */}
      <div className="flex flex-col justify-center items-center px-4 py-3 border-r border-nl-black/[0.07] shrink-0 gap-1 min-w-[72px]">
        <span className="text-xl leading-none">📍</span>
        <span className="text-[10px] font-black text-nl-black/50 tracking-wide">{city}</span>
      </div>
      {/* Forecast rows */}
      <div className="flex flex-col flex-1 divide-y divide-nl-black/[0.06]">
        {[saturday, sunday].map(day => {
          const label = new Date(day.date + 'T12:00:00').toLocaleDateString('en', { weekday: 'short' })
          return (
            <div key={day.date} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-nl-black/40 w-7 shrink-0">{label}</span>
              <span className="text-lg leading-none">{weatherEmoji(day.code)}</span>
              <span className="text-[11px] font-semibold text-nl-black/50 flex-1">{weatherLabel(day.code)}</span>
              <div className="flex items-baseline gap-1 shrink-0">
                <span className="text-sm font-black text-nl-black">{Math.round(day.max)}°</span>
                <span className="text-xs font-semibold text-nl-black/30">{Math.round(day.min)}°</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function Weekend({ value, onChange }: Props) {
  const { saturday, sunday, city, loading } = useWeekendWeather()
  const hasWeather = saturday && sunday

  return (
    <div className="flex flex-col gap-6 animate-fade-up">

      <label className="font-semibold text-sm uppercase tracking-widest text-nl-black/50">
        One highlight of your upcoming weekend?
      </label>

      {/* Weather widget */}
      {loading && (
        <div className="flex gap-3">
          {[0, 1].map(i => (
            <div key={i} className="flex-1 h-28 rounded-2xl bg-nl-black/[0.04] animate-pulse" />
          ))}
        </div>
      )}

      {hasWeather && (
        <WeatherWidget saturday={saturday} sunday={sunday} city={city} />
      )}

      {/* Text input */}
      <div className="flex flex-col gap-1.5">
        <textarea
          value={value}
          onChange={e => onChange(e.target.value.slice(0, MAX))}
          rows={4}
          className="border-2 border-nl-black/10 focus:border-nl-purple outline-none px-4 py-3 text-base font-normal text-nl-black placeholder:text-nl-black/30 transition-colors rounded-xl resize-none"
        />
        <span className="text-xs text-nl-black/30 text-right font-semibold">
          {value.length} / {MAX}
        </span>
      </div>

    </div>
  )
}
