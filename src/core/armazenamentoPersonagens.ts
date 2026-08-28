// Armazenamento de personagens — interface trocável (CLAUDE.md regra 4:
// "nunca acesse localStorage direto de dentro de componentes"). Hoje só
// existe a implementação local; nuvem (Supabase) entra na Fase 5.

import type { WizardSelection } from './personagem';
import type { ItemMochila } from './mochila';

export interface PersonagemSalvo {
  id: string;
  criadoEm: string;
  nivel: number;
  xp: number;
  pvAtual: number;
  selecao: WizardSelection;
  /** Campos abaixo guardam estado de progressão que muda DEPOIS da
   * criação (Level Up, Descanso, uso de recursos em combate) — tudo
   * opcional porque personagens salvos antes dessa entrega não têm
   * esses campos ainda; quem lê usa `??` com um fallback derivado de
   * `selecao`/nível 1 (ver `FichaShell.tsx`). Sem isso, dar F5 na
   * Ficha depois de subir de nível perdia o progresso — só `nivel`,
   * `xp` e `pvAtual` eram salvos, o resto (PV máximo real, Estilo de
   * Luta trocado, Maestria em Arma trocada, usos gastos de recurso)
   * só existia em estado do React, nunca em disco. */
  pvMax?: number;
  estiloDeLutaAtual?: string | null;
  maestriaArmaAtual?: string[];
  folegoGasto?: number;
  indomavelGasto?: number;
  surtoGasto?: number;
  espacosGastos?: number;
  inspiracaoGasto?: number;
  /** Truques conhecidos DEPOIS da criação — cresce/troca no Level Up
   * (Etapa 4.1). Ausente = personagem nunca passou por um Level Up
   * com troca de Truques ainda; `FichaShell.tsx` cai pra
   * `selecao.truquesEscolhidos` (retrato da criação) nesse caso. */
  truquesAtual?: string[];
  /** Mochila como estado de verdade (ver DECISOES-DESIGN.md "Mochila
   * vira estado de verdade") — quando ausente (personagem salvo antes
   * dessa entrega), `FichaShell.tsx` reconstrói a lista inicial a
   * partir de `selecao` (mesmo cálculo de sempre), só na 1ª vez. */
  itensMochilaAtual?: ItemMochila[];
  /** Rascunho do Level Up em andamento (passo de PV) — precisa
   * sobreviver a fechar o Level Up ou dar F5, senão o jogador
   * consegue "voltar" saindo da tela pra rolar o dado de vida de
   * novo. `null`/ausente = nenhuma rolagem pendente. Zerado só quando
   * o Level Up é confirmado (`FichaShell.tsx`, `confirmarLevelUp`).
   * Ver DECISOES-DESIGN.md "Level Up — dado de vida rolado...". */
  levelUpHpModo?: 'media' | 'rolar' | null;
  levelUpHpRolado?: number | null;
}

export interface ArmazenamentoPersonagens {
  listar(): PersonagemSalvo[];
  buscar(id: string): PersonagemSalvo | null;
  salvar(personagem: PersonagemSalvo): void;
  apagar(id: string): void;
}

const CHAVE = 'dnd-companion:personagens';

class ArmazenamentoLocalStorage implements ArmazenamentoPersonagens {
  listar(): PersonagemSalvo[] {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? (JSON.parse(bruto) as PersonagemSalvo[]) : [];
    } catch {
      return [];
    }
  }

  buscar(id: string): PersonagemSalvo | null {
    return this.listar().find((p) => p.id === id) ?? null;
  }

  salvar(personagem: PersonagemSalvo): void {
    const atuais = this.listar().filter((p) => p.id !== personagem.id);
    localStorage.setItem(CHAVE, JSON.stringify([...atuais, personagem]));
  }

  apagar(id: string): void {
    const restantes = this.listar().filter((p) => p.id !== id);
    localStorage.setItem(CHAVE, JSON.stringify(restantes));
  }
}

export const armazenamentoPersonagens: ArmazenamentoPersonagens = new ArmazenamentoLocalStorage();

export function gerarIdPersonagem(): string {
  return `pj-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}
