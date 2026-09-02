// Idioma extra concedido por característica de Classe nível 1 — além
// do Comum + 2 à escolha que toda Origem já concede (ver
// `LinguasStep.tsx`). Confirmado direto na aba "Características de
// Classe" da planilha mestra (ver PENDENCIAS.md/CLAUDE.md seção 8):
// só Druida (Idioma Druídico, fixo) e Ladino (Gíria do Ladrão — fixo +
// 1 idioma à escolha) concedem algo assim em nível 1. As outras 10
// classes ainda não foram auditadas linha a linha — ausentes deste
// mapa até a auditoria confirmar se concedem ou não.
//
// Idioma Druídico do Druida também concede "sempre tem a magia Falar
// com Animais preparada" — essa parte NÃO está coberta aqui (precisa
// do mesmo tipo de mecanismo de "característica concede magia" que
// falta pro Talento de Origem Iniciado em Magia, ver PENDENCIAS.md).

export interface IdiomaExtraClasse {
  /** Idiomas sempre concedidos, sem escolha (ex: Druídico). */
  fixo: string[];
  /** Quantidade de idiomas à escolha livre do jogador, além dos 2 da
   * Origem (ex: Ladino escolhe 1 a mais). */
  escolhaLivre: number;
}

export const idiomaExtraClasse: Record<string, IdiomaExtraClasse> = {
  Druida: { fixo: ['Druídico'], escolhaLivre: 0 },
  Ladino: { fixo: ['Gíria dos Ladrões'], escolhaLivre: 1 },
};
