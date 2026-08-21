// Gerado a partir de dnd-master-referencia.xlsx, aba "Características
// de Classe". Não editar valores à mão.
//
// Só Guerreiro importado por enquanto (piloto de Classes). Na célula da
// planilha, as descrições dos níveis 2 ("Mente Tática"), 5 ("Ataque
// Extra") e 20 ("Três Ataques Extras") vêm com a tabela "Características
// de Guerreiro" colada dentro do texto (problema de extração da
// planilha, mesmo padrão já visto em "Ferramentas de Entalhador" da aba
// Ferramentas) — removi esse trecho colado ao importar aqui, mantendo o
// parágrafo de regra intacto e idêntico ao original. Registrado em
// PENDENCIAS.md.

export interface CaracteristicaClasse {
  classe: string;
  nivel: number;
  nome: string;
  descricao: string;
  tipoAcao: string;
}

export const caracteristicasClasse: CaracteristicaClasse[] = [
  {
    classe: 'Guerreiro',
    nivel: 1,
    nome: 'Estilo de Luta',
    descricao:
      'Você aprimorou suas proezas marciais e tem um talento de Estilo de Luta à sua escolha (veja também o capítulo 5). Sempre que atinge um nível de Guerreiro, você pode substituir o talento que escolheu por um talento diferente de Estilo de Luta.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 1,
    nome: 'Maestria em Arma',
    descricao:
      'Seu treinamento com armas permite que você utilize as propriedades de maestria com três tipos de armas Simples ou Marciais à sua escolha. Sempre que completar um Descanso Longo, você pode praticar movimentos com armas e alterar uma dessas escolhas de armas. Ao alcançar certos níveis de Guerreiro, você adquire a habilidade de usar as propriedades de maestria de mais tipos de armas, conforme mostrado na coluna Maestria em Armas da tabela Características de Guerreiro.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 1,
    nome: 'Recuperar Fôlego',
    descricao:
      'Você tem uma reserva limitada de resistência física e mental que pode usar. Como uma Ação Bônus, você pode usá-la para recuperar Pontos de Vida iguais a 1d10 mais seu nível de Guerreiro. Você pode usar essa característica duas vezes. Você recupera um uso gasto quando completa um Descanso Curto e restaura todos os usos gastos quando completa um Descanso Longo. Ao atingir certos níveis de Guerreiro, você adquire mais usos dessa característica, conforme mostrado na coluna Recuperar Fôlego da tabela Características de Guerreiro.',
    tipoAcao: 'Ação Bônus',
  },
  {
    classe: 'Guerreiro',
    nivel: 2,
    nome: 'Mente Tática',
    descricao:
      'Você tem uma mente para táticas dentro e fora do campo de batalha. Ao falhar em um teste de atributo, você pode gastar um uso de seu Recuperar Fôlego para tentar alcançar a vitória. Em vez de recuperar Pontos de Vida, você joga 1d10 e adiciona o resultado ao teste de atributo, potencialmente transformando-o em sucesso. Se o teste ainda assim falhar, esse uso do Recuperar Fôlego não é gasto.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 2,
    nome: 'Surto de Ação',
    descricao:
      'Você pode se esforçar além de seus limites normais por um momento. No seu turno, você pode executar uma ação adicional, exceto a ação Usar Magia. Após usar esta característica, você não pode usá-la novamente até completar um Descanso Curto ou Longo. A partir do nível 17, você pode usá-lo duas vezes antes de um descanso, mas apenas uma vez em um turno.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 3,
    nome: 'Subclasse de Guerreiro',
    descricao:
      'Você adquire uma subclasse de Guerreiro à sua escolha. As subclasses Campeão, Cavaleiro Místico, Combatente Psíquico e Mestre da Batalha estão detalhadas após a descrição desta classe. Uma subclasse é uma especialidade que concede a você características em determinados níveis de Guerreiro. Pelo resto de sua jornada, você adquire cada uma das características de sua subclasse de seu nível de Guerreiro ou menor.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 4,
    nome: 'Aumento no Valor de Atributo',
    descricao:
      'Você adquire o talento Aumento no Valor de Atributo (veja o capítulo 5) ou outro talento à sua escolha para o qual atenda os pré-requisitos. Você adquire essa característica novamente nos níveis 6, 8, 12, 14 e 16 de Guerreiro.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 5,
    nome: 'Ajuste Tático',
    descricao:
      'Sempre que executar uma Ação Bônus para seu Recuperar Fôlego, você pode mover-se até metade do seu Deslocamento sem provocar Ataques de Oportunidade.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 5,
    nome: 'Ataque Extra',
    descricao: 'Você pode atacar duas vezes, em vez de uma, sempre que executar a ação Atacar no seu turno.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 9,
    nome: 'Indomável',
    descricao:
      'Ao falhar em uma salvaguarda, você pode jogá-la novamente adicionando um bônus igual ao seu nível de Guerreiro. Você deve usar o novo resultado e não pode usar essa característica novamente até completar um Descanso Longo. A partir do nível 13, você pode usar essa característica duas vezes antes de um Descanso Longo e três vezes antes de um Descanso Longo ao atingir o nível 17.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 9,
    nome: 'Mestre Tático',
    descricao:
      'Ao atacar com uma arma cuja propriedade de maestria você pode usar, você pode substituir essa propriedade pela propriedade Empurrar, Drenar ou Lentidão para esse ataque.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 11,
    nome: 'Dois Ataques Extras',
    descricao: 'Você pode atacar três vezes, em vez de uma, sempre que executar a ação Atacar no seu turno.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 13,
    nome: 'Ataques Estudados',
    descricao:
      'Você estuda seus oponentes e aprende com cada ataque que realiza. Se você realizar uma jogada de ataque contra uma criatura e errar, você tem Vantagem em sua próxima jogada de ataque contra essa criatura antes do final do seu próximo turno.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 19,
    nome: 'Dádiva Épica',
    descricao:
      'Você adquire o talento Dádiva Épica (veja o capítulo 5) ou outro talento à sua escolha para o qual se qualifica. Dádiva da Proeza em Combate é recomendada.',
    tipoAcao: 'Passiva / Estática',
  },
  {
    classe: 'Guerreiro',
    nivel: 20,
    nome: 'Três Ataques Extras',
    descricao: 'Você pode atacar quatro vezes, em vez de uma, sempre que executar a ação Atacar no seu turno.',
    tipoAcao: 'Passiva / Estática',
  },
];
