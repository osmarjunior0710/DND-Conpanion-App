// Gerado a partir de dnd-master-referencia.xlsx, aba "Progressão de
// Classe" (núcleo + progressão 1-20). Não editar valores à mão.
//
// Schema em camadas decidido em DECISOES-DESIGN.md ("Dados — Classes
// têm núcleo comum em 3 camadas, não 1"). Este arquivo cobre a Camada 1
// (núcleo universal) + Camada 2 (recursos, por enquanto só do
// Guerreiro). Características por nível (Camada 3) ficam em
// caracteristicasClasse.ts. Proficiências iniciais e equipamento de
// classe (que a planilha não tem) ficam em classesProficienciasIniciais.ts
// — exceção documentada, transcrita do Livro do Jogador.

import type { Atributo } from '../../wizardFixtures';

export interface RecursoClasse {
  nome: string;
  recuperaEm: string | null;
  valorPorNivel: Record<number, number>;
}

export interface NivelProgressaoClasse {
  nivel: number;
  bonusProficiencia: string;
  caracteristicas: string[];
}

export interface Classe {
  id: string;
  nome: string;
  atributoPrimario: string;
  dadoDeVida: string;
  salvaguardas: [Atributo, Atributo];
  nivelSubclasse: number;
  recursos: RecursoClasse[];
  progressao: NivelProgressaoClasse[];
  disponivel: boolean;
  fonte: string;
}

const FONTE = 'Livro do Jogador (D&D 5e 2024)';

export const classes: Classe[] = [
  {
    id: 'guerreiro',
    nome: 'Guerreiro',
    atributoPrimario: 'Força ou Destreza',
    dadoDeVida: 'd10',
    salvaguardas: ['FOR', 'CON'],
    nivelSubclasse: 3,
    recursos: [
      {
        nome: 'Recuperar Fôlego (usos)',
        recuperaEm: '1 uso no Descanso Curto, todos no Descanso Longo',
        valorPorNivel: {
          1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
          11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
        },
      },
      {
        nome: 'Maestria em Arma (nº de tipos de arma)',
        recuperaEm: null,
        valorPorNivel: {
          1: 3, 2: 3, 3: 3, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 5,
          11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 6, 17: 6, 18: 6, 19: 6, 20: 6,
        },
      },
    ],
    progressao: [
      { nivel: 1, bonusProficiencia: '+2', caracteristicas: ['Estilo de Luta', 'Maestria em Arma', 'Recuperar Fôlego'] },
      { nivel: 2, bonusProficiencia: '+2', caracteristicas: ['Mente Tática', 'Surto de Ação'] },
      { nivel: 3, bonusProficiencia: '+2', caracteristicas: ['Subclasse de Guerreiro'] },
      { nivel: 4, bonusProficiencia: '+2', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 5, bonusProficiencia: '+3', caracteristicas: ['Ajuste Tático', 'Ataque Extra'] },
      { nivel: 6, bonusProficiencia: '+3', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 7, bonusProficiencia: '+3', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 8, bonusProficiencia: '+3', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 9, bonusProficiencia: '+4', caracteristicas: ['Indomável', 'Mestre Tático'] },
      { nivel: 10, bonusProficiencia: '+4', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 11, bonusProficiencia: '+4', caracteristicas: ['Dois Ataques Extras'] },
      { nivel: 12, bonusProficiencia: '+4', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 13, bonusProficiencia: '+5', caracteristicas: ['Ataques Estudados', 'Indomável'] },
      { nivel: 14, bonusProficiencia: '+5', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 15, bonusProficiencia: '+5', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 16, bonusProficiencia: '+5', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 17, bonusProficiencia: '+6', caracteristicas: ['Indomável', 'Surto de Ação'] },
      { nivel: 18, bonusProficiencia: '+6', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 19, bonusProficiencia: '+6', caracteristicas: ['Dádiva Épica'] },
      { nivel: 20, bonusProficiencia: '+6', caracteristicas: ['Três Ataques Extras'] },
    ],
    disponivel: true,
    fonte: FONTE,
  },
];
