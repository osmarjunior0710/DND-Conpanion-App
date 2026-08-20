import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type CritTipo = 'sucesso' | 'falha' | null;

export interface RollState {
  label: string;
  formula: string;
  fase: 'rolando' | 'concluido';
  valorDado: number | string;
  total: number | null;
  critico: CritTipo;
}

interface RollD20Options {
  label: string;
  formula: string;
  mod: number;
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
  fechar: () => void;
}

const RollContext = createContext<RollContextValue | null>(null);

const DURACAO_ANIMACAO_MS = 480;

export function RollProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<RollState | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rolarD20 = useCallback(({ label, formula, mod, onResultado }: RollD20Options) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setEstado({ label, formula, fase: 'rolando', valorDado: '🎲', total: null, critico: null });
    timeoutRef.current = setTimeout(() => {
      const d20 = 1 + Math.floor(Math.random() * 20);
      const total = d20 + mod;
      const critico: CritTipo = d20 === 1 ? 'falha' : d20 === 20 ? 'sucesso' : null;
      setEstado({ label, formula, fase: 'concluido', valorDado: d20, total, critico });
      onResultado?.(total, d20);
    }, DURACAO_ANIMACAO_MS);
  }, []);

  const rolarDados = useCallback(({ label, formula, quantidade, lados, mod, onResultado }: RollDadosOptions) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setEstado({ label, formula, fase: 'rolando', valorDado: '🎲', total: null, critico: null });
    timeoutRef.current = setTimeout(() => {
      let soma = 0;
      for (let i = 0; i < quantidade; i++) soma += 1 + Math.floor(Math.random() * lados);
      const total = soma + mod;
      setEstado({ label, formula, fase: 'concluido', valorDado: '💥', total, critico: null });
      onResultado?.(total);
    }, DURACAO_ANIMACAO_MS);
  }, []);

  const fechar = useCallback(() => setEstado(null), []);

  return <RollContext.Provider value={{ estado, rolarD20, rolarDados, fechar }}>{children}</RollContext.Provider>;
}

export function useRoll(): RollContextValue {
  const ctx = useContext(RollContext);
  if (!ctx) throw new Error('useRoll precisa estar dentro de um <RollProvider>');
  return ctx;
}
