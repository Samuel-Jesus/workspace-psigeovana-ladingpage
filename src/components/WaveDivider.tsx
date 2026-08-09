import './WaveDivider.css'

type WaveVariant = 'descend' | 'ascend' | 'ribbon'

interface WaveDividerProps {
  from: string
  to: string
  variant?: WaveVariant
}

function mixHex(a: string, b: string, t: number): string {
  const parse = (h: string) => {
    const n = h.replace('#', '')
    return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16))
  }
  const [ar, ag, ab] = parse(a)
  const [br, bg, bb] = parse(b)
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0')
  return `#${ch(ar, br)}${ch(ag, bg)}${ch(ab, bb)}`
}

/**
 * Transição em duas camadas entre seções.
 * `from` = seção de cima · `to` = seção de baixo
 */
export function WaveDivider({ from, to, variant = 'descend' }: WaveDividerProps) {
  /* Mid tomado um pouco mais quente (0.35) para a faixa ler como lavanda/areia */
  const mid = mixHex(from, to, 0.35)

  return (
    <div className={`wave wave--${variant}`} style={{ background: from }} aria-hidden="true">
      <svg className="wave__svg" viewBox="0 0 1440 180" preserveAspectRatio="none">
        <path d={bands[variant]} fill={mid} />
        <path d={mains[variant]} fill={to} />
      </svg>
    </div>
  )
}

/* Curvas principais — silhueta da próxima seção */
const mains: Record<WaveVariant, string> = {
  descend:
    'M0,88 C150,36 310,148 540,108 C770,68 940,24 1160,64 C1300,90 1390,128 1440,108 L1440,180 L0,180 Z',
  ascend:
    'M0,118 C170,158 360,42 610,78 C860,114 1040,156 1240,92 C1350,58 1410,44 1440,54 L1440,180 L0,180 Z',
  ribbon:
    'M0,96 C240,48 460,148 720,108 C980,68 1200,36 1440,88 L1440,180 L0,180 Z',
}

/* Faixas acima — gap generoso (~36–44 unidades) para a cor mid aparecer */
const bands: Record<WaveVariant, string> = {
  descend:
    'M0,44 C160,0 320,100 540,64 C760,28 950,0 1160,28 C1300,48 1390,78 1440,62 L1440,180 L0,180 Z',
  ascend:
    'M0,74 C180,114 370,10 610,42 C850,74 1050,118 1250,58 C1360,28 1410,18 1440,26 L1440,180 L0,180 Z',
  ribbon:
    'M0,52 C250,16 470,108 730,72 C990,36 1210,8 1440,48 L1440,180 L0,180 Z',
}
