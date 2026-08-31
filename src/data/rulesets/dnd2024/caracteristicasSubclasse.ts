// Gerado a partir de dnd-master-referencia.xlsx, aba "Subclasses". Não
// editar valores à mão.
//
// Só Bardo / Colégio do Conhecimento importado por enquanto — as
// outras 3 subclasses de Bardo (Bravura, Dança, Glamour) e as
// subclasses das outras classes entram sob demanda, mesmo padrão de
// `caracteristicasClasse.ts`.
//
// "Tipo de Ação (auto, revisar)" da planilha marcou "Palavras de
// Interrupção" como "Passiva / Estática" — errado, o texto da própria
// descrição diz "você pode executar uma Reação". Corrigido aqui pra
// "Reação" (mesmo tipo de ajuste manual já feito em
// `caracteristicasClasse.ts` pro Contra-Encantamento do Bardo).

export interface CaracteristicaSubclasse {
  classe: string;
  subclasse: string;
  nivel: number;
  nome: string;
  descricao: string;
  tipoAcao: string;
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
];
