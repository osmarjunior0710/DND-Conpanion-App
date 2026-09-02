import { magias } from '../../data/rulesets/dnd2024/magias';
import MagiaComDescricao from './MagiaComDescricao';

interface TextoComMagiasProps {
  texto: string;
  /** nomes exatos de magia mencionados no texto — cada ocorrência vira
   * um termo clicável (mesmo padrão de Truques/Magias Preparadas) que
   * abre a descrição da magia, em vez de texto solto. */
  nomesMagias: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Divide `texto` nos pontos onde um dos `nomesMagias` aparece —
 * pedaços fora dessas ocorrências ficam como texto puro, os que batem
 * exatamente um nome viram marcador `magia`. Função pura, sem React,
 * pra poder testar a divisão isoladamente do componente. */
export function dividirTextoComMagias(texto: string, nomesMagias: string[]): { texto: string; magia: boolean }[] {
  if (nomesMagias.length === 0) return [{ texto, magia: false }];
  const regex = new RegExp(`(${nomesMagias.map(escapeRegExp).join('|')})`, 'g');
  return texto
    .split(regex)
    .filter((parte) => parte.length > 0)
    .map((parte) => ({ texto: parte, magia: nomesMagias.includes(parte) }));
}

/** Texto de descrição (ex: benefício de Invocação Mística) com nomes
 * de magia mencionados virando pill+ícone clicável (mesmo componente
 * `MagiaComDescricao` já usado em Truques/Magias Preparadas), em vez
 * de texto solto que o jogador não consegue consultar. */
export default function TextoComMagias({ texto, nomesMagias }: TextoComMagiasProps) {
  const partes = dividirTextoComMagias(texto, nomesMagias);
  return (
    <>
      {partes.map((parte, i) => {
        if (!parte.magia) return <span key={i}>{parte.texto}</span>;
        const magia = magias.find((m) => m.nome === parte.texto);
        if (!magia) return <span key={i}>{parte.texto}</span>;
        return <MagiaComDescricao key={i} magia={magia} />;
      })}
    </>
  );
}
