import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
} from 'react'

export interface WheelSegment {
  id: string
  label: string
  color: string
  value: number
}

interface WheelChartProps {
  segments: WheelSegment[]
  max?: number
  size?: number
  readOnly?: boolean
  onChange?: (id: string, value: number) => void
}

function polar(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + Math.cos(angle) * r,
    y: cy + Math.sin(angle) * r,
  }
}

/** Fatia anular entre r0–r1 e ângulos a0–a1 */
function ringSlice(
  cx: number,
  cy: number,
  r0: number,
  r1: number,
  a0: number,
  a1: number,
) {
  const p0 = polar(cx, cy, r1, a0)
  const p1 = polar(cx, cy, r1, a1)
  const p2 = polar(cx, cy, r0, a1)
  const p3 = polar(cx, cy, r0, a0)
  const large = a1 - a0 > Math.PI ? 1 : 0

  if (r0 <= 0.5) {
    return [
      `M${cx},${cy}`,
      `L${p0.x},${p0.y}`,
      `A${r1},${r1} 0 ${large} 1 ${p1.x},${p1.y}`,
      'Z',
    ].join(' ')
  }

  return [
    `M${p0.x},${p0.y}`,
    `A${r1},${r1} 0 ${large} 1 ${p1.x},${p1.y}`,
    `L${p2.x},${p2.y}`,
    `A${r0},${r0} 0 ${large} 0 ${p3.x},${p3.y}`,
    'Z',
  ].join(' ')
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function hapticTap() {
  if (typeof navigator === 'undefined' || prefersReducedMotion()) return
  try {
    navigator.vibrate?.(16)
  } catch {
    /* ignore */
  }
}

/** Interpola as notas da roda para animar o preenchimento. */
function useAnimatedScores(targets: number[], duration = 380) {
  const [display, setDisplay] = useState(targets)
  const displayRef = useRef(targets)
  const rafRef = useRef(0)
  const key = targets.join(',')

  useEffect(() => {
    const from = displayRef.current
    const to = key.split(',').map(Number)

    if (prefersReducedMotion()) {
      displayRef.current = to
      setDisplay(to)
      return
    }

    const same = from.length === to.length && from.every((v, i) => v === to[i])
    if (same) return

    const start = performance.now()
    cancelAnimationFrame(rafRef.current)

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const e = easeOutCubic(t)
      const next = from.map((f, i) => f + ((to[i] ?? 0) - f) * e)
      displayRef.current = next
      setDisplay(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [key, duration])

  return display
}

/**
 * Roda da Vida interativa: clique na fatia no nível desejado (1–10).
 * Preenche do centro para fora, cada área com cor própria.
 */
export function WheelChart({
  segments,
  max = 10,
  size = 420,
  readOnly = false,
  onChange,
}: WheelChartProps) {
  const uid = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const [pulseId, setPulseId] = useState<string | null>(null)
  const pulseTimer = useRef(0)

  const n = segments.length
  const cx = size / 2
  const cy = size / 2
  const innerR = size * 0.06
  const outerR = size * 0.36
  const labelR = size * 0.44
  const step = (outerR - innerR) / max
  const slice = (Math.PI * 2) / n
  const startOffset = -Math.PI / 2

  const targetScores = useMemo(() => segments.map((s) => s.value), [segments])
  const displayScores = useAnimatedScores(targetScores)

  const levels = useMemo(() => Array.from({ length: max }, (_, i) => i + 1), [max])

  const angleOf = (i: number) => startOffset + i * slice

  const scoreFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current
      if (!svg) return 1
      const pt = svg.createSVGPoint()
      pt.x = clientX
      pt.y = clientY
      const ctm = svg.getScreenCTM()
      if (!ctm) return 1
      const local = pt.matrixTransform(ctm.inverse())
      const dx = local.x - cx
      const dy = local.y - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist <= innerR) return 1
      const raw = Math.ceil((dist - innerR) / step)
      return Math.max(1, Math.min(max, raw))
    },
    [cx, cy, innerR, max, step],
  )

  const triggerPulse = (id: string) => {
    setPulseId(id)
    window.clearTimeout(pulseTimer.current)
    pulseTimer.current = window.setTimeout(() => setPulseId(null), 420)
  }

  useEffect(() => () => window.clearTimeout(pulseTimer.current), [])

  const handleSegmentClick = (
    e: MouseEvent<SVGElement>,
    segmentIndex: number,
    id: string,
  ) => {
    if (readOnly || !onChange) return
    const score = scoreFromPoint(e.clientX, e.clientY)
    const current = segments[segmentIndex]?.value ?? 0
    const next = current === score ? 0 : score
    hapticTap()
    triggerPulse(id)
    onChange(id, next)
  }

  return (
    <div className="wheel-chart-wrap">
      <svg
        ref={svgRef}
        className="wheel-chart"
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label="Roda da vida interativa. Clique em cada área para avaliar de 1 a 10."
      >
        <defs>
          {segments.map((s) => (
            <linearGradient
              key={s.id}
              id={`${uid}-${s.id}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={s.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
            </linearGradient>
          ))}
        </defs>

        {levels.map((level) => (
          <circle
            key={`ring-${level}`}
            cx={cx}
            cy={cy}
            r={innerR + level * step}
            className="wheel-chart__ring"
            fill="none"
          />
        ))}

        {segments.map((seg, i) => {
          const a0 = angleOf(i)
          const a1 = a0 + slice
          const hit = ringSlice(cx, cy, innerR, outerR, a0, a1)
          const displayValue = displayScores[i] ?? 0
          const fillR =
            innerR + (Math.max(0, Math.min(displayValue, max)) / max) * (outerR - innerR)
          const showFill = displayValue > 0.05
          const fill = showFill ? ringSlice(cx, cy, innerR, fillR, a0, a1) : ''
          const pulsing = pulseId === seg.id

          return (
            <g
              key={seg.id}
              className={`wheel-chart__segment${pulsing ? ' is-pulsing' : ''}`}
            >
              {showFill && (
                <path
                  d={fill}
                  fill={`url(#${uid}-${seg.id})`}
                  className="wheel-chart__fill"
                  pointerEvents="none"
                />
              )}

              <path
                d={hit}
                className={`wheel-chart__hit${readOnly ? ' wheel-chart__hit--readonly' : ''}`}
                fill="transparent"
                stroke="rgba(51, 25, 60, 0.22)"
                strokeWidth={1}
                onClick={(e) => handleSegmentClick(e, i, seg.id)}
                onKeyDown={(e) => {
                  if (readOnly || !onChange) return
                  if (e.key === 'ArrowUp' || e.key === '+') {
                    e.preventDefault()
                    hapticTap()
                    triggerPulse(seg.id)
                    onChange(seg.id, Math.min(max, (seg.value || 0) + 1))
                  }
                  if (e.key === 'ArrowDown' || e.key === '-') {
                    e.preventDefault()
                    hapticTap()
                    triggerPulse(seg.id)
                    onChange(seg.id, Math.max(0, (seg.value || 0) - 1))
                  }
                }}
                tabIndex={readOnly ? -1 : 0}
                role={readOnly ? 'img' : 'slider'}
                aria-label={`${seg.label}: ${seg.value} de ${max}`}
                aria-valuemin={readOnly ? undefined : 0}
                aria-valuemax={readOnly ? undefined : max}
                aria-valuenow={readOnly ? undefined : seg.value}
              />

              {levels.map((level) => {
                const mid = a0 + slice / 2
                const r = innerR + level * step - step * 0.15
                const p = polar(cx, cy, r, mid)
                const active = displayValue >= level - 0.15
                return (
                  <circle
                    key={`${seg.id}-lv-${level}`}
                    cx={p.x}
                    cy={p.y}
                    r={active ? 2.2 : 1.4}
                    className="wheel-chart__level-dot"
                    fill={active ? seg.color : 'rgba(51,25,60,0.18)'}
                    pointerEvents="none"
                    opacity={active ? 0.9 : 0.45}
                  />
                )
              })}
            </g>
          )
        })}

        <circle cx={cx} cy={cy} r={innerR} className="wheel-chart__hub" />

        {segments.map((_, i) => {
          const a = angleOf(i)
          const tip = polar(cx, cy, outerR, a)
          return (
            <line
              key={`spoke-${i}`}
              x1={cx}
              y1={cy}
              x2={tip.x}
              y2={tip.y}
              className="wheel-chart__spoke"
              pointerEvents="none"
            />
          )
        })}

        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          className="wheel-chart__outline"
          fill="none"
          pointerEvents="none"
        />

        {segments.map((seg, i) => {
          const mid = angleOf(i) + slice / 2
          const p = polar(cx, cy, labelR, mid)
          const cos = Math.cos(mid)
          const anchor =
            Math.abs(cos) < 0.25 ? 'middle' : cos > 0 ? 'start' : 'end'
          return (
            <text
              key={`label-${seg.id}`}
              x={p.x}
              y={p.y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="wheel-chart__label"
              fill={seg.color}
              pointerEvents="none"
            >
              {seg.label}
            </text>
          )
        })}
      </svg>
    </div>
  )
}

/** Paleta distinta por área da Roda da Vida */
export const WHEEL_COLORS: Record<string, string> = {
  saude: '#5b8c5a',
  'trabalho-financas': '#c4a35a',
  familia: '#c45c6a',
  amigos: '#6b8cae',
  'relacionamento-amoroso': '#b86b9a',
  lazer: '#d4896a',
  autocuidado: '#7a9e8e',
  emocoes: '#8c67ac',
  sono: '#5a6f9e',
  futuro: '#9a7b5a',
}
