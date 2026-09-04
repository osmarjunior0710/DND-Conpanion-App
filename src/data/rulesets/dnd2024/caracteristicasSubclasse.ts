// Gerado a partir de dnd-master-referencia.xlsx, aba "Subclasses". Não
// editar valores à mão.
//
// Bardo / Colégio do Conhecimento + Bruxo / Patrono Ínfero importados
// — as outras 3 de Bardo (Bravura, Dança, Glamour) e as outras 3 de
// Bruxo (Arquifada, Celestial, Grande Antigo) entram sob demanda,
// mesmo padrão de `caracteristicasClasse.ts`.
//
// "Tipo de Ação (auto, revisar)" da planilha marcou "Palavras de
// Interrupção" como "Passiva / Estática" — errado, o texto da própria
// descrição diz "você pode executar uma Reação". Corrigido aqui pra
// "Reação" (mesmo tipo de ajuste manual já feito em
// `caracteristicasClasse.ts` pro Contra-Encantamento do Bardo).
//
// Bruxo / Patrono Ínfero — "Lançar no Inferno" (nível 14) tinha o
// início da seção de Clérigo colado no final da célula (mesmo
// problema de extração já documentado no CLAUDE.md seção 8) — cortado
// na importação, mantendo só o parágrafo de regra real. Também tinha
// um espaço quebrando a palavra "tem" ("e t em a condição") — corrigido.

export interface CaracteristicaSubclasse {
  classe: string;
  subclasse: string;
  nivel: number;
  nome: string;
  descricao: string;
  tipoAcao: string;
  /** Só "Magias de Pacto do Ínfero" (Bruxo) hoje — lista fixa de
   * magias sempre preparadas por nível de classe, sem escolha do
   * jogador (diferente de "Descobertas Mágicas" do Bardo, que É uma
   * escolha). `undefined` nas outras características. */
  magiasFixasPorNivel?: Record<number, string[]>;
}

export const caracteristicasSubclasse: CaracteristicaSubclasse[] = [
  {
    classe: 'Bardo',
    subclasse: 'Colégio do Conhecimento',
    nivel: 3,
    nome: 'Palavras de Interrupção',
    descricao:
      'Você aprende a usar sua sagacidade para distrair, confundir e diminuir sobrenaturalmente a confiança e a competência dos outros. Quando uma criatura à sua vista a até 18 metros de você realizar uma jogada de dano, ou for bem-sucedida em um teste de atributo ou jogada de ataque, você pode executar uma Reação para gastar um uso da sua Inspiração de Bardo. Jogue o dado de Inspiração de Bardo e subtraia o número jogado do resultado da criatura, reduzindo o dano ou transformando potencialmente o sucesso em fracasso.',
    tipoAcao: 'Reação',
  },
  {
    classe: 'Bardo',
    subclasse: 'Colégio do Conhecimento',
    nivel: 3,
    nome: 'Proficiências Bônus',
    descricao: 'Você adquire proficiência em três perícias à sua escolha.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Bardo',
    subclasse: 'Colégio do Conhecimento',
    nivel: 6,
    nome: 'Descobertas Mágicas',
    descricao:
      'Você aprende duas magias à sua escolha. Essas magias podem vir da lista de magias de Clérigo, Druida ou Mago, ou uma combinação dessas listas (veja a seção da classe para a respectiva lista de magias). A magia escolhida deve ser um truque ou uma magia para a qual você tenha espaços de magia disponíveis, conforme mostrado na tabela Características de Bardo. Você sempre tem as magias escolhidas preparadas e, sempre que adquirir um novo nível de Bardo, pode substituir uma das magias por outra que atenda a esses requisitos.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Bardo',
    subclasse: 'Colégio do Conhecimento',
    nivel: 14,
    nome: 'Perícia Inigualável',
    descricao:
      'Quando você realizar um teste de atributo ou uma jogada de ataque e falhar, pode gastar um uso da Inspiração de Bardo; jogue o dado da Inspiração de Bardo e adicione o resultado jogado ao d20, transformando potencialmente a falha em sucesso. Se falhar, o uso da Inspiração de Bardo não é gasto.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Bruxo',
    subclasse: 'Patrono Ínfero',
    nivel: 3,
    nome: 'Bênção do Tenebroso',
    descricao:
      'Ao reduzir um inimigo a 0 Pontos de Vida, você adquire Pontos de Vida Temporários iguais ao seu modificador de Carisma mais seu nível de Bruxo (mínimo de 1 Ponto de Vida Temporário). Você também recebe esse benefício se outra pessoa reduzir um inimigo a até 3 metros de você a 0 Pontos de Vida.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Bruxo',
    subclasse: 'Patrono Ínfero',
    nivel: 3,
    nome: 'Magias de Pacto do Ínfero',
    descricao:
      'A magia do seu patrono assegura que você sempre tenha algumas magias disponíveis; ao atingir um nível de Bruxo indicado na tabela Magias do Ínfero, você sempre tem essas magias preparadas. Magias do Ínfero — Nível 3: Comando, Mãos Flamejantes, Raio Ardente, Sugestão. Nível 5: Bola de Fogo, Nuvem Fétida. Nível 7: Escudo Ardente, Muralha de Fogo. Nível 9: Missão, Praga de Insetos.',
    tipoAcao: 'Passiva / Estática',
    magiasFixasPorNivel: {
      3: ['Comando', 'Mãos Flamejantes', 'Raio Ardente', 'Sugestão'],
      5: ['Bola de Fogo', 'Nuvem Fétida'],
      7: ['Escudo Ardente', 'Muralha de Fogo'],
      9: ['Missão', 'Praga de Insetos'],
    },
  },
  {
    classe: 'Bruxo',
    subclasse: 'Patrono Ínfero',
    nivel: 6,
    nome: 'A Sorte do Próprio Tenebroso',
    descricao:
      'Você pode chamar seu patrono Ínfero para alterar o destino a seu favor. Ao realizar um teste de atributo ou uma salvaguarda, você pode usar essa característica para adicionar 1d10 à sua jogada. Você pode fazer isso após ver a jogada, mas antes que qualquer um dos efeitos da jogada ocorra. Você pode usar essa característica um número de vezes igual ao seu modificador de Carisma (mínimo de uma vez), no máximo uma vez por jogada, e restaura todos os usos gastos ao completar um Descanso Longo.',
    tipoAcao: 'Recurso limitado (revisar tipo de ativação)',
  },
  {
    classe: 'Bruxo',
    subclasse: 'Patrono Ínfero',
    nivel: 10,
    nome: 'Resistência Ínfera',
    descricao:
      'Ao completar um Descanso Curto ou Longo, escolha um tipo de dano, exceto Energético. Você tem Resistência a esse tipo de dano até escolher um tipo de dano diferente com esta característica.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Bruxo',
    subclasse: 'Patrono Ínfero',
    nivel: 14,
    nome: 'Lançar no Inferno',
    descricao:
      'Uma vez por turno, ao atingir uma criatura com uma jogada de ataque, você pode tentar transportar instantaneamente o alvo para os Planos Inferiores. O alvo deve ser bem-sucedido em uma salvaguarda de Carisma contra a CD para evitar sua magia, ou ele desaparece e atravessa uma paisagem de pesadelo. O alvo sofre 8d10 pontos de dano Psíquico se não for um Ínfero e tem a condição Incapacitado até o final do seu próximo turno, quando retorna ao espaço que ocupava anteriormente ou ao espaço desocupado mais próximo. Você pode usar esta característica novamente após completar um Descanso Longo, a menos que gaste um espaço de Magia de Pacto (nenhuma ação é necessária) para restaurar seu uso.',
    tipoAcao: 'Grátis',
  },
];
