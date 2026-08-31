// Indicador linear (M3) — usado hoje só pra Pontos de Vida na aba
// Combat. Trecho preenchido colorido por severidade (bom/atenção/
// perigo), trecho restante em tom neutro. Começou como a variante
// "wavy" (M3 Expressive) — trocado pra reto a pedido do Osmar (mais
// legível que a onda).

const VIEW_W = 300;
const VIEW_H = 24;
const BASELINE = VIEW_H / 2;

export function corPorPercentual(pct: number): string {
  if (pct <= 0.25) return 'var(--danger)';
  if (pct <= 0.5) return 'var(--warn)';
  return 'var(--good)';
}

interface LinearProgressBarProps {
  valor: number;
  maximo: number;
  altura?: number;
}

export default function LinearProgressBar({ valor, maximo, altura = 20 }: LinearProgressBarProps) {
  const pct = maximo > 0 ? Math.max(0, Math.min(1, valor / maximo)) : 0;
  const xCorte = pct * VIEW_W;
  const corAtiva = corPorPercentual(pct);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: altura, display: 'block' }}
      role="img"
      aria-label={`Pontos de Vida: ${Math.round(pct * 100)}%`}
    >
      <line
        x1={0}
        y1={BASELINE}
        x2={VIEW_W}
        y2={BASELINE}
        stroke="var(--line)"
        strokeWidth={3}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      {xCorte > 0 && (
        <line
          x1={0}
          y1={BASELINE}
          x2={xCorte}
          y2={BASELINE}
          stroke={corAtiva}
          strokeWidth={5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
