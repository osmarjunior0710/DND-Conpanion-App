// Armazenamento de personagens — interface trocável (CLAUDE.md regra 4:
// "nunca acesse localStorage direto de dentro de componentes"). Hoje só
// existe a implementação local; nuvem (Supabase) entra na Fase 5.

import type { WizardSelection } from './personagem';

export interface PersonagemSalvo {
  id: string;
  criadoEm: string;
  nivel: number;
  xp: number;
  pvAtual: number;
  selecao: WizardSelection;
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
