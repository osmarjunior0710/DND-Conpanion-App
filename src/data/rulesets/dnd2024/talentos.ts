// Gerado a partir de dnd-master-referencia.xlsx, aba "Talentos"
// (filtro: Categoria = "Origem"). Não editar valores à mão — regenerar
// a partir da planilha se algo mudar.

export interface TalentoOrigem {
  id: string;
  nome: string;
  repetivel: boolean;
  beneficios: string;
  pagina: number;
  fonte: string;
}

export const talentosOrigem: TalentoOrigem[] = [
  {
    id: "alerta",
    nome: "Alerta",
    repetivel: false,
    beneficios: "Soma Bônus de Proficiência na Iniciativa. Pode trocar sua Iniciativa com a de um aliado voluntário imediatamente após rolar (nenhum dos dois pode estar Incapacitado).",
    pagina: 199,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "artifista",
    nome: "Artifista",
    repetivel: false,
    beneficios: "Proficiência com 3 Ferramentas de Artesão à escolha. 20% de desconto em itens não-mágicos. Ao completar Descanso Longo, fabrica um item da tabela Fabricação Rápida (se tiver a ferramenta certa); some no próximo Descanso Longo.",
    pagina: 200,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "atacante-selvagem",
    nome: "Atacante Selvagem",
    repetivel: false,
    beneficios: "1x/turno, ao acertar com arma, role o dano da arma duas vezes e use qualquer um dos resultados.",
    pagina: 201,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "curandeiro",
    nome: "Curandeiro",
    repetivel: false,
    beneficios: "Com Kit de Curandeiro: gasta 1 uso (Ação Usar Objeto) pra tratar alguém a 1,5m — ele gasta 1 Dado de Vida, você rola, ele cura o resultado + seu Bônus de Proficiência. Sempre que rolar dado de cura (magia ou este talento), pode rerolar se tirar 1.",
    pagina: 201,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "habilidoso",
    nome: "Habilidoso",
    repetivel: true,
    beneficios: "Proficiência em 3 perícias ou ferramentas à escolha, em qualquer combinação.",
    pagina: 201,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "iniciado-em-magia",
    nome: "Iniciado em Magia",
    repetivel: true,
    beneficios: "Escolhe lista de Clérigo, Druida ou Mago: 2 truques + 1 magia de 1º círculo sempre preparada (conjura 1x/dia grátis, senão gasta espaço). Atributo de conjuração (Int/Sab/Car) escolhido ao pegar o talento. Repetível: precisa escolher lista diferente cada vez.",
    pagina: 201,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "musico",
    nome: "Músico",
    repetivel: false,
    beneficios: "Proficiência com 3 Instrumentos Musicais. Ao completar Descanso Curto/Longo, toca música e dá Inspiração Heroica a um número de aliados = seu Bônus de Proficiência.",
    pagina: 202,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "sortudo",
    nome: "Sortudo",
    repetivel: false,
    beneficios: "Pontos de Sorte = Bônus de Proficiência (recarrega em Descanso Longo). Gaste 1 pra: dar Vantagem numa jogada sua de d20, impor Desvantagem num ataque contra você, ou (nível 5+) transformar um acerto crítico contra você em acerto normal.",
    pagina: 201,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "valentao-de-taverna",
    nome: "Valentão de Taverna",
    repetivel: false,
    beneficios: "Ataque Desarmado causa 1d4+Força Contundente (em vez do normal); pode rerolar 1 no dano. Proficiência com armas improvisadas. 1x/turno, ao acertar Desarmado na ação Atacar, pode empurrar o alvo 1,5m.",
    pagina: 202,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
  {
    id: "vigoroso",
    nome: "Vigoroso",
    repetivel: false,
    beneficios: "PV máximo +2x seu nível de personagem ao pegar o talento; +2 PV extra a cada nível seguinte.",
    pagina: 202,
    fonte: 'Livro do Jogador (D&D 5e 2024)',
  },
];
