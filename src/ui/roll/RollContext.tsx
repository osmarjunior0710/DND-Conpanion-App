import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type CritTipo = 'sucesso' | 'falha' | null;

export type Vantagem = 'vantagem' | 'desvantagem';

/** Categoria da rolagem 'd20' — hoje só usada pra decidir se um bônus
 * extra registrado (ver `BonusExtraProvider`) pode aparecer nela.
 * "Teste de atributo" cobre perícia também (perícia É um teste de
 * atributo, regra 5e). Ataque/iniciativa ficam de fora de propósito —
 * nenhuma característica que soma bônus avulso hoje se aplica a eles. */
export type CategoriaRolagemD20 = 'atributoOuSalvaguarda';

/** Uma característica tipo "A Sorte do Próprio Tenebroso" — soma
 * 1 dado avulso a uma rolagem 'd20' já concluída, com usos limitados.
 * Registrado pela Ficha (`FichaShell`) via `registrarBonusExtra`
 * porque o `RollOverlay` é global (montado em `App.tsx`, fora da
 * árvore da Ficha) e não tem acesso direto ao estado do personagem —
 * mesmo problema que Vantagem/Desvantagem não tem (não depende de
 * personagem nenhum). Genérico de propósito: a próxima característica
 * parecida (ex: Orientação/Guidance +1d4) reaproveita sem precisar de
 * um 2º mecanismo. */
export interface BonusExtraProvider {
  /** Rótulo curto pro botão — ex: "Sorte do Ten.". */
  rotulo: string;
  lados: number;
  restantes: number;
  maximo: number;
  /** Consome 1 uso — `false` se não tinha mais uso (não deveria
   * acontecer, já que o botão só aparece com `restantes > 0`, mas a
   * função confia em quem chama pra não duplicar a regra de limite). */
  usar: () => boolean;
}

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
  /** Categoria opcional — `undefined`/ausente = nenhum bônus extra
   * pode se aplicar a esta rolagem. */
  categoria?: CategoriaRolagemD20;
  /** Preenchido quando o jogador já aplicou o `BonusExtraProvider`
   * registrado — guarda rótulo + valor rolado, pra mostrar a quebra
   * do total e travar o botão (regra real: no máximo 1x por jogada). */
  bonusExtra?: { rotulo: string; valor: number } | null;
}

interface RollD20Options {
  label: string;
  formula: string;
  mod: number;
  /** Rola 2d20 já de cara e usa o maior ('vantagem') ou o menor
   * ('desvantagem') — omitido = rolagem normal (1d20), com os botões
   * de Vantagem/Desvantagem disponíveis depois do resultado. */
  vantagem?: Vantagem;
  /** Ver `CategoriaRolagemD20` — omitido = nenhum bônus extra
   * registrado pode se aplicar a esta rolagem. */
  categoria?: CategoriaRolagemD20;
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
  /** Bônus extra registrado agora (ver `BonusExtraProvider`) — `null`
   * quando nenhuma característica desse tipo está disponível pro
   * personagem da tela atual. */
  bonusExtraDisponivel: BonusExtraProvider | null;
  /** A Ficha chama isso num `useEffect` toda vez que o recurso do
   * personagem muda (usos restantes, nível, etc.) — passar `null`
   * remove o registro (ex: ao sair da tela). */
  registrarBonusExtra: (provider: BonusExtraProvider | null) => void;
  /** Consome 1 uso do `bonusExtraDisponivel` atual e soma o dado
   * rolado ao total da rolagem concluída em exibição — só tem efeito
   * numa rolagem 'd20' concluída, com a categoria certa, sem bônus
   * já aplicado, e com usos restantes. */
  aplicarBonusExtra: () => void;
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

  const rolarD20 = useCallback(({ label, formula, mod, vantagem, categoria, onResultado }: RollD20Options) => {
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
      categoria,
      bonusExtra: null,
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
          categoria,
          bonusExtra: null,
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
          categoria,
          bonusExtra: null,
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

  const [bonusExtraProvider, setBonusExtraProvider] = useState<BonusExtraProvider | null>(null);
  const registrarBonusExtra = useCallback((provider: BonusExtraProvider | null) => setBonusExtraProvider(provider), []);

  const aplicarBonusExtra = useCallback(() => {
    if (!estado || estado.fase !== 'concluido' || estado.tipo !== 'd20') return;
    if (!estado.categoria || estado.bonusExtra) return;
    if (!bonusExtraProvider || bonusExtraProvider.restantes <= 0) return;
    if (!bonusExtraProvider.usar()) return;
    const valor = 1 + Math.floor(Math.random() * bonusExtraProvider.lados);
    setEstado((prev) =>
      prev ? { ...prev, bonusExtra: { rotulo: bonusExtraProvider.rotulo, valor }, total: (prev.total ?? 0) + valor } : prev,
    );
  }, [estado, bonusExtraProvider]);

  return (
    <RollContext.Provider
      value={{
        estado,
        rolarD20,
        rolarDados,
        escolherVantagemPosRolagem,
        fechar,
        bonusExtraDisponivel: bonusExtraProvider,
        registrarBonusExtra,
        aplicarBonusExtra,
      }}
    >
      {children}
    </RollContext.Provider>
  );
}

export function useRoll(): RollContextValue {
  const ctx = useContext(RollContext);
  if (!ctx) throw new Error('useRoll precisa estar dentro de um <RollProvider>');
  return ctx;
}
