import { useState } from 'react';

const PREFIXO_CHAVE = 'dnd-companion:colapsavel:';

/** Estado aberto/fechado de uma seção colapsável, lembrado entre sessões
 * (ex: Espaços de Magia). Preferência de UI, não dado de personagem —
 * por isso não entra em `PersonagemSalvo`/`armazenamentoPersonagens`. */
export function useColapsavel(chave: string, padrao: boolean = true) {
  const [expandido, setExpandidoState] = useState<boolean>(() => {
    try {
      const bruto = localStorage.getItem(PREFIXO_CHAVE + chave);
      return bruto === null ? padrao : bruto === '1';
    } catch {
      return padrao;
    }
  });

  function setExpandido(valor: boolean) {
    setExpandidoState(valor);
    try {
      localStorage.setItem(PREFIXO_CHAVE + chave, valor ? '1' : '0');
    } catch {
      // ignora — preferência de UI, sem fallback necessário
    }
  }

  return [expandido, setExpandido] as const;
}
