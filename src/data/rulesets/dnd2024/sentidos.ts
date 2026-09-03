// Sentidos Especiais — Apêndice C (Glossário de Regras). Antes só
// existiam como texto solto dentro da descrição de traço de espécie ou
// de Invocação Mística; virou campo estruturado (`sentidoConcedido`,
// ver `especies.ts`/`invocacoesMisticas.ts`) pra poder ser somado de
// várias fontes (`core/sentidos.ts`). Visão Comum não entra — todo
// personagem já tem, não é algo que precisa ser "concedido".

export type TipoSentido = 'visaoNoEscuro' | 'visaoAsCegas' | 'visaoVerdadeira' | 'sismiconsciencia';

export interface SentidoConcedido {
  tipo: TipoSentido;
  alcanceMetros: number;
}

export const NOME_SENTIDO: Record<TipoSentido, string> = {
  visaoNoEscuro: 'Visão no Escuro',
  visaoAsCegas: 'Visão às Cegas',
  visaoVerdadeira: 'Visão Verdadeira',
  sismiconsciencia: 'Sismiconsciência',
};

export const ORDEM_SENTIDOS: TipoSentido[] = ['visaoNoEscuro', 'visaoAsCegas', 'visaoVerdadeira', 'sismiconsciencia'];
