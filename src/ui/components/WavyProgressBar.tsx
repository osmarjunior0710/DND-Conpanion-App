// Indicador linear "wavy" (M3 Expressive) — usado hoje só pra Pontos
// de Vida na aba Combat. Estrutura M3 primeiro (seção 5.1 do
// CLAUDE.md): onda contínua, trecho preenchido colorido por
// severidade (bom/atenção/perigo), trecho restante em tom neutro.
//
// viewBox fixo com preserveAspectRatio="none" — o SVG estica pra
// largura real do container, então o desenho da onda não depende de
// medir o elemento em JS.

const VIEW_W = 300;
const VIEW_H = 24;
const AMPLITUDE = 4;
const WAVELENGTH = 30;
const BASELINE = VIEW_H / 2;

function pontoY(x: number): number {
  return BASELINE + AMPLITUDE * Math.sin((2 * Math.PI * x) / WAVELENGTH);
}

function gerarPontos(xInicio: number, xFim: number): string {
  if (xFim <= xInicio) return '';
  const pontos: string[] = [];
  const passo = 3;
  for (let x = xInicio; x < xFim; x += passo) pontos.push(`${x},${pontoY(x).toFixed(2)}`);
  pontos.push(`${xFim},${pontoY(xFim).toFixed(2)}`);
  return pontos.join(' ');
}

export function corPorPercentual(pct: number): string {
  if (pct <= 0.25) return 'var(--danger)';
  if (pct <= 0.5) return 'var(--warn)';
  return 'var(--good)';
}

interface WavyProgressBarProps {
  valor: number;
  maximo: number;
  altura?: number;
}

export default function WavyProgressBar({ valor, maximo, altura = 28 }: WavyProgressBarProps) {
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
      {xCorte < VIEW_W && (
        <polyline
          points={gerarPontos(xCorte, VIEW_W)}
          fill="none"
          stroke="var(--line)"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {xCorte > 0 && (
        <polyline
          points={gerarPontos(0, xCorte)}
          fill="none"
          stroke={corAtiva}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
    </svg>
  );
}
