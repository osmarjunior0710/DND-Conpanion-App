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
  /** Subclasse escolhida — versão placeholder (ver PENDENCIAS.md
   * "Escolha de subclasse — versão placeholder"): só o nome, usado
   * hoje pra trocar o ícone do personagem na Lista. Nenhuma
   * característica mecânica de subclasse existe ainda. */
  subclasseAtual?: string | null;
  estiloDeLutaAtual?: string | null;
  maestriaArmaAtual?: string[];
  folegoGasto?: number;
  indomavelGasto?: number;
  surtoGasto?: number;
  /** @deprecated Etapa 4.1 — só existia 1 círculo simultâneo possível.
   * Substituído por `espacosGastosPorCirculo` (Etapa 4.2). Mantido só
   * pra migrar personagens salvos antes dessa entrega (ver
   * `FichaShell.tsx`) — nunca mais escrito. */
  espacosGastos?: number;
  /** Espaços de Magia gastos, por círculo (Etapa 4.2 — Bardo pode ter
   * 2+ círculos ativos ao mesmo tempo a partir do nível 3). Chave =
   * número do círculo. Ausente = personagem nunca gastou espaço desde
   * essa entrega; `FichaShell.tsx` migra de `espacosGastos` (campo
   * antigo) nesse caso. */
  espacosGastosPorCirculo?: Record<number, number>;
  inspiracaoGasto?: number;
  /** Truques conhecidos DEPOIS da criação — cresce/troca no Level Up
   * (Etapa 4.1). Ausente = personagem nunca passou por um Level Up
   * com troca de Truques ainda; `FichaShell.tsx` cai pra
   * `selecao.truquesEscolhidos` (retrato da criação) nesse caso. */
  truquesAtual?: string[];
  /** Magias Preparadas DEPOIS da criação — cresce/troca no Level Up
   * (Etapa 4.3, mesmo padrão de `truquesAtual`). Ausente = personagem
   * nunca passou por um Level Up com troca de Magias Preparadas
   * ainda; `FichaShell.tsx` cai pra `selecao.magiasPreparadasEscolhidas`
   * (retrato da criação) nesse caso. */
  magiasPreparadasAtual?: string[];
  /** Perícias escolhidas pra Especialização (dobra o Bônus de
   * Proficiência) — característica "Especialista" do Bardo, ganha nos
   * níveis 2 e 9 (2 escolhas por vez, acumulativas, sem troca — ver
   * `core/levelUp.ts` `niveisComEspecialista`). Ausente/vazio =
   * personagem ainda não passou por um desses níveis. */
  periciasEspecialistaAtual?: string[];
  /** IDs dos Talentos Gerais escolhidos nos níveis de ASI/Talento (ver
   * `core/levelUp.ts` `niveisComASI`, `data/rulesets/dnd2024/talentos.ts`)
   * — acumula 1 por nível em que o jogador escolheu "Talento" em vez de
   * "Aumentar Atributos". Fase 3 do plano de Talentos (ver
   * DECISOES-DESIGN.md/PENDENCIAS.md): só salva e mostra o talento,
   * `[PH]` — nenhum efeito mecânico de verdade ainda (Fase 4). */
  talentosGeraisAtual?: string[];
  /** IDs de talentos marcados com 📌 na tela de escolha do Level Up —
   * planejamento de build ("quero pegar isso num level up futuro"),
   * não afeta nenhuma regra. Ausente/vazio = nenhum favoritado. */
  talentosFavoritosAtual?: string[];
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
