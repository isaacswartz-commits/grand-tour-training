import { useEffect, useState } from 'react'

// Placeholder splash — will be replaced by router + real screens in build steps 3+
export default function App() {
  const [tick, setTick] = useState(false)

  // Subtle pulse on the countdown — demonstrates the timer pattern
  useEffect(() => {
    const id = setInterval(() => setTick(t => !t), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100svh', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '24px' }}>

      {/* ── HUD header panel ── */}
      <div className="hud-panel" style={{ width: '100%', maxWidth: 420, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Grand Tour
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-amber)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            0 / 84 stages
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 12, height: 6, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: '0%', background: 'var(--color-amber)', borderRadius: 2, transition: 'width var(--duration-slow) var(--ease-snap)' }} />
        </div>
      </div>

      {/* ── Countdown demo panel ── */}
      <div className="hud-panel" style={{ width: '100%', maxWidth: 420, padding: '28px 24px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
          Current Time
        </div>

        <div className="hud-numeral" style={{ opacity: tick ? 1 : 0.85, transition: 'opacity var(--duration-fast) linear' }}>
          00:40
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'baseline' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Countdown (sec)
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            Total Duration <strong style={{ color: 'var(--color-text)' }}>40s</strong>
          </span>
        </div>

        <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-amber)', letterSpacing: '-0.01em' }}>
          Kettlebell Swings
        </div>

        {/* Set indicator */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Set 1 of 4
          </span>
          {/* Progress ring placeholder */}
          <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={20} cy={20} r={16} fill="none" stroke="var(--color-border)" strokeWidth={3} />
            <circle cx={20} cy={20} r={16} fill="none" stroke="var(--color-cyan)" strokeWidth={3}
              strokeDasharray={`${2 * Math.PI * 16}`}
              strokeDashoffset={`${2 * Math.PI * 16 * 0.25}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset var(--duration-base) var(--ease-out)' }}
            />
          </svg>
        </div>
      </div>

      {/* ── Action buttons demo ── */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', gap: 12 }}>
        <button
          style={{
            flex: 1,
            padding: '14px 0',
            background: 'var(--color-amber)',
            color: '#0a0a0f',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: 'none',
            borderRadius: 'var(--hud-radius)',
            cursor: 'pointer',
            transition: 'opacity var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={e => e.target.style.opacity = 0.85}
          onMouseLeave={e => e.target.style.opacity = 1}
        >
          Tackle this Workout
        </button>
        <button
          style={{
            padding: '14px 20px',
            background: 'transparent',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            border: 'var(--hud-border)',
            borderRadius: 'var(--hud-radius)',
            cursor: 'pointer',
            transition: 'color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={e => e.target.style.color = 'var(--color-text)'}
          onMouseLeave={e => e.target.style.color = 'var(--color-text-muted)'}
        >
          Pause
        </button>
      </div>

      {/* ── Footer label ── */}
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-dim)', textAlign: 'center', margin: 0 }}>
        Design system preview · screens coming in build steps 3–9
      </p>
    </div>
  )
}
