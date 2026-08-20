// Dados FIXOS de level-up pra Fase 0 — mesmos exemplos do wireframe.
// Características por nível reais (da planilha mestra) entram na Fase 1.

export const dadoVidaValor: Record<string, number> = { d6: 4, d8: 5, d10: 6, d12: 7 };

export const featuresPorNivel: Record<number, string[]> = {
  2: ['Recurso de classe aprimorado (exemplo)'],
  3: ['Subclasse — escolha obrigatória neste nível'],
  4: ['Aumento no Valor de Atributo ou Talento'],
  5: ['Ataque Extra (classes marciais) / novo círculo de magia (conjuradores)'],
};

export const niveisComSubclasse = [3];
export const niveisComASI = [4, 8, 12, 16, 19];

export const subclassesBruxoExemplo = ['Pacto do Barganha', 'Pacto da Lâmina', 'Pacto da Corrente', 'Pacto do Tomo'];
