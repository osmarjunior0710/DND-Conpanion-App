import { useEffect, useState } from 'react';

const DURACAO_PADRAO_MS = 3000;

/** Aviso/erro de validação (a tarja fixa vermelha `.warning`) que some
 * sozinho depois de um tempo — antes ficava preso na tela até o
 * jogador corrigir e tentar avançar de novo, o que o Osmar achou
 * demorado demais. `setAviso(null)` continua funcionando pra limpar
 * na hora (ex: ao corrigir e avançar com sucesso). */
export function useAvisoTemporario(duracaoMs: number = DURACAO_PADRAO_MS) {
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (aviso === null) return;
    const id = setTimeout(() => setAviso(null), duracaoMs);
    return () => clearTimeout(id);
  }, [aviso, duracaoMs]);

  return [aviso, setAviso] as const;
}
