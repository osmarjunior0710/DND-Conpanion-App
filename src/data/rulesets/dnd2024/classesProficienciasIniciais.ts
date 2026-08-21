// Exceção documentada ao padrão "só planilha" (ver CLAUDE.md seção 3 e
// DECISOES-DESIGN.md) — igual descricoesOrigens.ts. A aba "Progressão de
// Classe" não tem coluna de proficiência inicial (armadura/arma/perícia)
// nem de equipamento inicial de classe (diferente do equipamento de
// Origem, que já vem da planilha). Transcrito direto da tabela "Traços
// Básicos de Guerreiro", Livro do Jogador (D&D 5e 2024), Cap. 3, pág. 127
// — com autorização explícita do Osmar, que enviou o PDF do capítulo.
//
// Se um dia a planilha ganhar essas colunas, este arquivo pode ser
// apagado e o campo migrado pra dentro de classes.ts via regeneração
// normal.

export interface ItemEquipamento {
  nome: string;
  quantidade: number;
  unidade: string | null;
}

export interface OpcaoEquipamentoClasse {
  rotulo: string;
  itens: ItemEquipamento[];
  ouro: number;
}

export interface ProficienciasIniciaisClasse {
  classeId: string;
  periciasEscolha: { quantidade: number; opcoes: string[] };
  proficienciaArmas: string;
  proficienciaArmadura: string;
  equipamentoInicial: OpcaoEquipamentoClasse[];
  fonte: string;
}

export const proficienciasIniciaisClasse: Record<string, ProficienciasIniciaisClasse> = {
  guerreiro: {
    classeId: 'guerreiro',
    periciasEscolha: {
      quantidade: 2,
      opcoes: [
        'Acrobacia',
        'Atletismo',
        'História',
        'Intimidação',
        'Intuição',
        'Lidar com Animais',
        'Percepção',
        'Persuasão',
        'Sobrevivência',
      ],
    },
    proficienciaArmas: 'Armas Simples e Marciais',
    proficienciaArmadura: 'Armaduras Leves, Médias e Pesadas e Escudos',
    equipamentoInicial: [
      {
        rotulo: 'A',
        itens: [
          { nome: 'Cota de Malha', quantidade: 1, unidade: null },
          { nome: 'Espada Grande', quantidade: 1, unidade: null },
          { nome: 'Mangual', quantidade: 1, unidade: null },
          { nome: 'Azagaia', quantidade: 8, unidade: null },
          { nome: 'Kit de Explorador de Masmorras', quantidade: 1, unidade: null },
        ],
        ouro: 4,
      },
      {
        rotulo: 'B',
        itens: [
          { nome: 'Armadura de Couro Batido', quantidade: 1, unidade: null },
          { nome: 'Cimitarra', quantidade: 1, unidade: null },
          { nome: 'Espada Curta', quantidade: 1, unidade: null },
          { nome: 'Arco Longo', quantidade: 1, unidade: null },
          { nome: 'Flecha', quantidade: 20, unidade: null },
          { nome: 'Aljava', quantidade: 1, unidade: null },
          { nome: 'Kit de Explorador de Masmorras', quantidade: 1, unidade: null },
        ],
        ouro: 11,
      },
      {
        rotulo: 'C',
        itens: [],
        ouro: 155,
      },
    ],
    fonte: 'Livro do Jogador (D&D 5e 2024), Cap. 3, pág. 127',
  },
};
