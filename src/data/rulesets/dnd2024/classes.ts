// Gerado a partir de dnd-master-referencia.xlsx, aba "Progressão de
// Classe" (núcleo + progressão 1-20). Não editar valores à mão.
//
// Schema em camadas decidido em DECISOES-DESIGN.md ("Dados — Classes
// têm núcleo comum em 3 camadas, não 1"). Este arquivo cobre a Camada 1
// (núcleo universal) + Camada 2 (recursos — Guerreiro e Bardo por
// enquanto). Características por nível (Camada 3) ficam em
// caracteristicasClasse.ts. Proficiências iniciais e equipamento de
// classe (que a planilha não tem) ficam em classesProficienciasIniciais.ts
// — exceção documentada, transcrita do Livro do Jogador.
//
// Bardo: os "Espaços de Magia" viraram 9 recursos separados (1 por
// círculo) em vez de 1 recurso com sub-tabela, pra reaproveitar o
// mesmo `RecursoClasse` genérico sem precisar de um schema novo —
// cada círculo recupera no Descanso Longo, igual pros outros casters
// (ver DECISOES-DESIGN.md "Casters"). Valor 0 num nível = ainda não
// tem espaço daquele círculo, não é ausência de dado.

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
  {
    id: 'bardo',
    nome: 'Bardo',
    atributoPrimario: 'Carisma',
    dadoDeVida: 'd8',
    salvaguardas: ['DES', 'CAR'],
    nivelSubclasse: 3,
    recursos: [
      {
        nome: 'Dados de Inspiração de Bardo (tipo do dado)',
        recuperaEm: 'Todos no Descanso Longo (a partir do nível 5, também no Descanso Curto — Fonte de Inspiração)',
        valorPorNivel: {
          1: 6, 2: 6, 3: 6, 4: 6, 5: 8, 6: 8, 7: 8, 8: 8, 9: 8, 10: 10,
          11: 10, 12: 10, 13: 10, 14: 10, 15: 12, 16: 12, 17: 12, 18: 12, 19: 12, 20: 12,
        },
      },
      {
        nome: 'Truques Conhecidos',
        recuperaEm: null,
        valorPorNivel: {
          1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 4,
          11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
        },
      },
      {
        nome: 'Magias Preparadas',
        recuperaEm: null,
        valorPorNivel: {
          1: 4, 2: 5, 3: 6, 4: 7, 5: 9, 6: 10, 7: 11, 8: 12, 9: 14, 10: 15,
          11: 16, 12: 16, 13: 17, 14: 17, 15: 18, 16: 18, 17: 19, 18: 20, 19: 21, 20: 22,
        },
      },
      {
        nome: 'Espaços de Magia — 1º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 2, 2: 3, 3: 4, 4: 4, 5: 4, 6: 4, 7: 4, 8: 4, 9: 4, 10: 4,
          11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4, 18: 4, 19: 4, 20: 4,
        },
      },
      {
        nome: 'Espaços de Magia — 2º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
          11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
        },
      },
      {
        nome: 'Espaços de Magia — 3º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 2, 6: 3, 7: 3, 8: 3, 9: 3, 10: 3,
          11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
        },
      },
      {
        nome: 'Espaços de Magia — 4º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 1, 8: 2, 9: 3, 10: 3,
          11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3, 17: 3, 18: 3, 19: 3, 20: 3,
        },
      },
      {
        nome: 'Espaços de Magia — 5º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1, 10: 2,
          11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 3, 19: 3, 20: 3,
        },
      },
      {
        nome: 'Espaços de Magia — 6º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
          11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 2, 20: 2,
        },
      },
      {
        nome: 'Espaços de Magia — 7º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
          11: 0, 12: 0, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 2,
        },
      },
      {
        nome: 'Espaços de Magia — 8º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
          11: 0, 12: 0, 13: 0, 14: 0, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1,
        },
      },
      {
        nome: 'Espaços de Magia — 9º Círculo',
        recuperaEm: 'Descanso Longo',
        valorPorNivel: {
          1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0,
          11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 1, 18: 1, 19: 1, 20: 1,
        },
      },
    ],
    progressao: [
      { nivel: 1, bonusProficiencia: '+2', caracteristicas: ['Inspiração de Bardo', 'Conjuração'] },
      { nivel: 2, bonusProficiencia: '+2', caracteristicas: ['Especialista', 'Pau pra Toda Obra'] },
      { nivel: 3, bonusProficiencia: '+2', caracteristicas: ['Subclasse de Bardo'] },
      { nivel: 4, bonusProficiencia: '+2', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 5, bonusProficiencia: '+3', caracteristicas: ['Fonte de Inspiração'] },
      { nivel: 6, bonusProficiencia: '+3', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 7, bonusProficiencia: '+3', caracteristicas: ['Contra-Encantamento'] },
      { nivel: 8, bonusProficiencia: '+3', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 9, bonusProficiencia: '+4', caracteristicas: ['Especialização'] },
      { nivel: 10, bonusProficiencia: '+4', caracteristicas: ['Segredos Mágicos'] },
      { nivel: 11, bonusProficiencia: '+4', caracteristicas: [] },
      { nivel: 12, bonusProficiencia: '+4', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 13, bonusProficiencia: '+5', caracteristicas: [] },
      { nivel: 14, bonusProficiencia: '+5', caracteristicas: ['Característica de Subclasse'] },
      { nivel: 15, bonusProficiencia: '+5', caracteristicas: [] },
      { nivel: 16, bonusProficiencia: '+5', caracteristicas: ['Aumento no Valor de Atributo'] },
      { nivel: 17, bonusProficiencia: '+6', caracteristicas: [] },
      { nivel: 18, bonusProficiencia: '+6', caracteristicas: ['Inspiração Superior'] },
      { nivel: 19, bonusProficiencia: '+6', caracteristicas: ['Dádiva Épica'] },
      { nivel: 20, bonusProficiencia: '+6', caracteristicas: ['Palavras de Criação'] },
    ],
    // Etapa 2 feita — wizard sabe criar um Bardo de ponta a ponta
    // (perícias, ferramentas, truques, magias preparadas,
    // equipamento). Falta só a aba Magias/Combat da Ficha usar esses
    // dados de verdade (Etapa 3+), mas a criação em si já funciona.
    disponivel: true,
    fonte: FONTE,
  },
];
