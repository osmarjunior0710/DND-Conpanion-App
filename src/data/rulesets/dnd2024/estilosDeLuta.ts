// Gerado a partir de dnd-master-referencia.xlsx, aba "Talentos",
// filtrado por Categoria = "Estilo de Luta". Não editar valores à mão
// (exceto `efeitoMecanico` — ver aviso em `talentos.ts`, mesmo campo,
// mesmo motivo, adicionado aqui à mão fora da geração automática).
//
// Esses 10 talentos são escolhidos por classes como Guerreiro (nível 1),
// Paladino e Guardião (nível 2) — a coluna "Benefícios" da planilha já
// tinha um resumo mecânico curto pronto (não é frase corrida como as
// descrições de outros talentos), então foi usada como está.

import type { EfeitoMecanicoTalento } from './talentos';

export interface EstiloDeLuta {
  id: string;
  nome: string;
  beneficios: string;
  /** Ver `EfeitoMecanicoTalento` em `talentos.ts` — ausente = ainda
   * `[PH]` (Fase 4 não chegou nesse Estilo de Luta). */
  efeitoMecanico?: EfeitoMecanicoTalento;
  pagina: number;
  fonte: string;
}

export const estilosDeLuta: EstiloDeLuta[] = [
  {
    id: 'arquearia',
    nome: 'Arquearia',
    beneficios: '+2 nas jogadas de ataque com armas à distância.',
    efeitoMecanico: { tipo: 'bonus-ataque-distancia', bonus: 2 },
    pagina: 209,
    fonte: 'PHB 2024',
  },
  {
    id: 'combate-com-armas-de-arremesso',
    nome: 'Combate com Armas de Arremesso',
    beneficios: '+2 no dano ao acertar ataque à distância com arma de Arremesso.',
    pagina: 209,
    fonte: 'PHB 2024',
  },
  {
    id: 'combate-com-armas-grandes',
    nome: 'Combate com Armas Grandes',
    beneficios: 'Ao rolar dano com arma corpo a corpo de duas mãos (Duas Mãos ou Versátil empunhada com 2 mãos): trata 1s e 2s como 3.',
    pagina: 209,
    fonte: 'PHB 2024',
  },
  {
    id: 'combate-com-duas-armas',
    nome: 'Combate com Duas Armas',
    beneficios: 'Soma mod. de atributo no dano do ataque adicional de arma Leve, se ainda não somava.',
    pagina: 209,
    fonte: 'PHB 2024',
  },
  {
    id: 'combate-desarmado',
    nome: 'Combate Desarmado',
    beneficios: 'Ataque Desarmado causa 1d6+Força Contundente (1d8 se sem arma/escudo em mãos). Início do turno: 1d4 Contundente extra a criatura Imobilizada por você.',
    pagina: 210,
    fonte: 'PHB 2024',
  },
  {
    id: 'defensivo',
    nome: 'Defensivo',
    beneficios: '+1 CA enquanto usa armadura Leve, Média ou Pesada.',
    efeitoMecanico: { tipo: 'bonus-ca-com-armadura', bonus: 1 },
    pagina: 210,
    fonte: 'PHB 2024',
  },
  {
    id: 'duelismo',
    nome: 'Duelismo',
    beneficios: 'Com 1 arma corpo a corpo numa mão e nenhuma outra arma: +2 no dano dessa arma.',
    efeitoMecanico: { tipo: 'bonus-dano-uma-mao-sem-outra-arma', bonus: 2 },
    pagina: 210,
    fonte: 'PHB 2024',
  },
  {
    id: 'interceptacao',
    nome: 'Interceptação',
    beneficios: 'Reação: quando alguém à vista acerta outra criatura a 1,5m de você, reduz o dano em 1d10+Bônus de Proficiência. Precisa empunhar Escudo ou arma Simples/Marcial.',
    pagina: 210,
    fonte: 'PHB 2024',
  },
  { id: 'luta-as-cegas', nome: 'Luta às Cegas', beneficios: 'Visão às Cegas 3m.', pagina: 210, fonte: 'PHB 2024' },
  {
    id: 'protetivo',
    nome: 'Protetivo',
    beneficios: 'Reação: quando alguém à vista ataca alvo (não você) a 1,5m de você, interpõe Escudo (se empunhado) — Desvantagem no ataque desencadeador e em todos contra o alvo até seu próximo turno, enquanto você ficar a 1,5m dele.',
    pagina: 210,
    fonte: 'PHB 2024',
  },
];
