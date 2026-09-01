import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type CritTipo = 'sucesso' | 'falha' | null;

export type Vantagem = 'vantagem' | 'desvantagem';

export interface RollState {
  label: string;
  formula: string;
  fase: 'rolando' | 'concluido';
  /** 'd20' = sempre 1 dado de 20 lados (teste/salvaguarda/ataque) — só
   * esse tipo aceita Vantagem/Desvantagem, inclusive escolhida DEPOIS
   * de ver o primeiro resultado. 'dados' = quantidade/lados
   * variáveis (dano e outras rolagens de dado avulso) — nunca tem
   * Vantagem/Desvantagem, regra de D&D não usa esse conceito aqui. */
  tipo: 'd20' | 'dados';
  valorDado: number | string;
  /** Segundo d20, só quando Vantagem/Desvantagem está em jogo (pré-
   * definida na chamada ou escolhida depois pelo jogador). `'🎲'`
   * enquanto rola, `null`/`undefined` quando não há 2º dado. */
  dado2?: number | string | null;
  /** Qual das duas regras está valendo pro par de d20 acima — null
   * quando não há Vantagem/Desvantagem nesta rolagem. */
  vantagem?: Vantagem | null;
  /** Só em rolagens tipo 'd20' — guardado pra poder recalcular o
   * total quando o jogador escolhe Vantagem/Desvantagem depois de já
   * ver o primeiro resultado (ver `escolherVantagemPosRolagem`). */
  mod?: number;
  total: number | null;
  critico: CritTipo;
  /** Mostra os botões Desvantagem/Vantagem — só true pra uma rolagem
   * 'd20' já concluída, sem Vantagem/Desvantagem pré-definida e sem
   * 2º dado ainda escolhido. Vira false assim que o jogador decide. */
  podeEscolherVantagem: boolean;
}

interface RollD20Options {
  label: string;
  formula: string;
  mod: number;
  /** Rola 2d20 já de cara e usa o maior ('vantagem') ou o menor
   * ('desvantagem') — omitido = rolagem normal (1d20), com os botões
   * de Vantagem/Desvantagem disponíveis depois do resultado. */
  vantagem?: Vantagem;
  onResultado?: (total: number, d20: number) => void;
}

interface RollDadosOptions {
  label: string;
  formula: string;
  quantidade: number;
  lados: number;
  mod: number;
  onResultado?: (total: number) => void;
}

interface RollContextValue {
  estado: RollState | null;
  rolarD20: (opts: RollD20Options) => void;
  rolarDados: (opts: RollDadosOptions) => void;
  /** Só tem efeito numa rolagem 'd20' concluída, sem Vantagem/
   * Desvantagem ainda decidida — rola um 2º d20 e usa o maior
   * ('vantagem') ou o menor ('desvantagem') dos dois, recalculando
   * total e crítico a partir do dado escolhido. */
  escolherVantagemPosRolagem: (tipo: Vantagem) => void;
  fechar: () => void;
}

const RollContext = createContext<RollContextValue | null>(null);

const DURACAO_ANIMACAO_MS = 480;

function rolarD20Dado(): number {
  return 1 + Math.floor(Math.random() * 20);
}

function criticoDe(d20: number): CritTipo {
  return d20 === 1 ? 'falha' : d20 === 20 ? 'sucesso' : null;
}

export function RollProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<RollState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rolarD20 = useCallback(({ label, formula, mod, vantagem, onResultado }: RollD20Options) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setEstado({
      label,
      formula,
      fase: 'rolando',
      tipo: 'd20',
      valorDado: '🎲',
      dado2: vantagem ? '🎲' : null,
      vantagem: vantagem ?? null,
      mod,
      total: null,
      critico: null,
      podeEscolherVantagem: false,
    });
    timeoutRef.current = setTimeout(() => {
      const rolagem1 = rolarD20Dado();
      if (vantagem) {
        const rolagem2 = rolarD20Dado();
        const usado = vantagem === 'vantagem' ? Math.max(rolagem1, rolagem2) : Math.min(rolagem1, rolagem2);
        const total = usado + mod;
        setEstado({
          label,
          formula,
          fase: 'concluido',
          tipo: 'd20',
          valorDado: rolagem1,
          dado2: rolagem2,
          vantagem,
          mod,
          total,
          critico: criticoDe(usado),
          podeEscolherVantagem: false,
        });
        onResultado?.(total, usado);
      } else {
        const total = rolagem1 + mod;
        setEstado({
          label,
          formula,
          fase: 'concluido',
          tipo: 'd20',
          valorDado: rolagem1,
          dado2: null,
          vantagem: null,
          mod,
          total,
          critico: criticoDe(rolagem1),
          podeEscolherVantagem: true,
        });
        onResultado?.(total, rolagem1);
      }
    }, DURACAO_ANIMACAO_MS);
  }, []);

  const rolarDados = useCallback(({ label, formula, quantidade, lados, mod, onResultado }: RollDadosOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setEstado({
      label,
      formula,
      fase: 'rolando',
      tipo: 'dados',
      valorDado: '🎲',
      total: null,
      critico: null,
      podeEscolherVantagem: false,
    });
    timeoutRef.current = setTimeout(() => {
      let soma = 0;
      for (let i = 0; i < quantidade; i++) soma += 1 + Math.floor(Math.random() * lados);
      const total = soma + mod;
      setEstado({
        label,
        formula,
        fase: 'concluido',
        tipo: 'dados',
        valorDado: '💥',
        total,
        critico: null,
        podeEscolherVantagem: false,
      });
      onResultado?.(total);
    }, DURACAO_ANIMACAO_MS);
  }, []);

  const escolherVantagemPosRolagem = useCallback((tipo: Vantagem) => {
    setEstado((prev) => {
      if (!prev || prev.fase !== 'concluido' || prev.tipo !== 'd20' || !prev.podeEscolherVantagem) return prev;
      return { ...prev, dado2: '🎲', vantagem: tipo, podeEscolherVantagem: false };
    });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setEstado((prev) => {
        if (!prev || prev.tipo !== 'd20') return prev;
        const rolagem1 = typeof prev.valorDado === 'number' ? prev.valorDado : 0;
        const rolagem2 = rolarD20Dado();
        const usado = prev.vantagem === 'vantagem' ? Math.max(rolagem1, rolagem2) : Math.min(rolagem1, rolagem2);
        const total = usado + (prev.mod ?? 0);
        return { ...prev, dado2: rolagem2, total, critico: criticoDe(usado) };
      });
    }, DURACAO_ANIMACAO_MS);
  }, []);

  const fechar = useCallback(() => setEstado(null), []);

  return (
    <RollContext.Provider value={{ estado, rolarD20, rolarDados, escolherVantagemPosRolagem, fechar }}>
      {children}
    </RollContext.Provider>
  );
}

export function useRoll(): RollContextValue {
  const ctx = useContext(RollContext);
  if (!ctx) throw new Error('useRoll precisa estar dentro de um <RollProvider>');
  return ctx;
}
