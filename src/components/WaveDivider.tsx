interface WaveDividerProps {
  bgColor: string
  fillColor: string
  variant?: 1 | 2 | 3
}

/* Cada path preenche a área abaixo da curva (fill = próxima seção) */
const paths: Record<number, string> = {
  1: 'M0,42 C360,80 1080,4 1440,42 L1440,80 L0,80 Z',
  2: 'M0,0 C400,78 1040,0 1440,56 L1440,80 L0,80 Z',
  3: 'M0,58 C420,18 1020,72 1440,28 L1440,80 L0,80 Z',
}

export function WaveDivider({ bgColor, fillColor, variant = 1 }: WaveDividerProps) {
  return (
    <div
      className="wave"
      style={{ background: bgColor }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        style={{
          display: 'block',
          width: '100%',
          height: 'clamp(44px, 5vw, 80px)',
        }}
      >
        <path d={paths[variant]} fill={fillColor} />
      </svg>
    </div>
  )
}
