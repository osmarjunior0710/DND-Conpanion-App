// Descrições narrativas das 16 origens — ÚNICA exceção no projeto onde a
// fonte é o Livro do Jogador (D&D 5e 2024, Cap. 4 "Origens dos
// Personagens"), não a planilha mestra. A aba "Antecedentes" da planilha
// não tem coluna de descrição narrativa (só dados mecânicos); o Osmar
// confirmou com o PDF do capítulo que o texto existe no livro e pediu
// pra transcrever direto aqui. Ver DECISOES-DESIGN.md.
//
// Chave = id da origem (mesmo slug usado em origens.ts).

export const descricoesOrigens: Record<string, string> = {
  acolito:
    'Você se dedicou ao serviço em um templo, localizado em uma aldeia ou em um bosque sagrado, onde realizava ritos em homenagem a um deus ou panteão. Sob a orientação de um sacerdote, você estudou religião e, graças à sua devoção, aprendeu a canalizar um pouco do poder divino para o seu local de culto e para as pessoas que ali oravam.',
  andarilho:
    'Você cresceu nas ruas cercado por rejeitados igualmente malfadados, alguns deles amigos e outros rivais. Você dormia onde podia e fazia bicos por comida. Às vezes, quando a fome se tornava insuportável, você recorria ao furto. Ainda assim, você nunca perdeu seu orgulho e nunca abandonou a esperança. O destino ainda não terminou com você.',
  artesao:
    'Você começou a limpar o chão e esfregar balcões na oficina de um artesão por alguns trocados por dia assim que ficou forte o suficiente para carregar um balde. Ao se tornar aprendiz, aprendeu a fabricar artesanatos básicos e a lidar com clientes exigentes, desenvolvendo também um olhar aguçado para detalhes.',
  artista:
    'Você passou a juventude em feiras e festivais itinerantes, fazendo bicos para músicos e acrobatas em troca de aulas. Aprendeu a andar na corda bamba, tocar alaúde de um jeito distinto e recitar poesia com dicção impecável. Até hoje, prospera com aplausos e anseia pelo palco.',
  charlatao:
    'Assim que você atingiu a idade para pedir uma cerveja, escolheu seu banquinho favorito em cada taverna a quinze quilômetros de onde nasceu. Ao percorrer o circuito de bares e botequins, aprendeu a lidar com os infelizes em busca de mentiras reconfortantes — talvez uma poção falsa ou registros de ancestralidade forjados.',
  criminoso:
    'Você sobrevivia em becos escuros, furtando pessoas ou assaltando lojas. Talvez fizesse parte de uma pequena gangue de criminosos que se protegem mutuamente, ou fosse um lobo solitário, enfrentando a guilda dos ladrões locais e os criminosos mais temíveis.',
  eremita:
    'Você passou seus primeiros anos isolado em uma cabana ou mosteiro localizado bem além dos arredores do povoado mais próximo. Naqueles dias, seus únicos companheiros eram as criaturas da floresta e aqueles que ocasionalmente faziam uma visita para trazer suprimentos e notícias do mundo externo. A solidão permitia que você passasse muitas horas ponderando os mistérios da criação.',
  escriba:
    'Você passou anos de formação em um scriptorium, um mosteiro dedicado à preservação do conhecimento ou uma agência governamental, onde aprendeu a escrever com uma mão firme e produzir textos finamente escritos. Talvez você tenha escrito documentos governamentais ou copiado tomos de literatura. Você pode ter alguma habilidade como escritor de poesia, narrativa ou pesquisa acadêmica. Acima de tudo, você tem uma atenção cuidadosa aos detalhes, o que lhe ajuda a evitar a introdução de erros aos documentos que você copia e cria.',
  fazendeiro:
    'Você cresceu perto da terra. Os anos cuidando de animais e cultivando a terra o recompensaram com paciência e boa saúde. Você tem um grande apreço pela generosidade da natureza, juntamente com um respeito saudável pela ira dela.',
  guarda:
    'Seus pés doem quando você se lembra das incontáveis horas que passou em seu posto na torre. Você foi treinado para manter um olho atento para o que ocorria do lado de fora da muralha, observando saqueadores vasculhando a floresta próxima, e seu outro olho voltado para dentro da muralha, procurando por assaltantes e encrenqueiros.',
  guia: 'Você cresceu ao ar livre, longe de terras povoadas. Sua casa ficava em qualquer lugar que você escolhesse para estender seu saco de dormir. Há maravilhas na natureza — monstros estranhos, florestas e riachos intocados, ruínas imensas de grandes salões outrora pisados por gigantes — e você aprendeu a se defender enquanto as explorava. De tempos em tempos, você guiava sacerdotes da natureza amigáveis que o instruíam nos fundamentos de canalizar a magia da natureza.',
  marinheiro:
    'Você viveu como um marinheiro, com o vento nas costas e os conveses balançando sob seus pés. Você já se sentou em bancos de bar em mais portos de escala do que consegue se lembrar, enfrentou grandes tempestades e trocou histórias com pessoas que vivem sob as ondas.',
  mercador:
    'Você foi aprendiz de um comerciante, mestre de caravanas ou lojista, aprendendo os fundamentos do comércio. Com ele, viajou bastante e ganhou a vida comprando e vendendo as matérias-primas que os artesãos precisam para praticar seu ofício, ou trabalhos acabados de tais artesãos. Você pode ter transportado mercadorias de um lugar para outro (por navio, carroça ou caravana) ou comprado de comerciantes viajantes e vendido em sua própria loja.',
  nobre:
    'Você foi criado em um castelo, cercado por riqueza, poder e privilégio. Sua família de aristocratas menores garantiu que você recebesse uma educação de primeira categoria, com conteúdos que você apreciava e outros dos quais se ressentia. Seu tempo no castelo, especialmente as muitas horas que passou observando sua família na corte, também lhe ensinou muito sobre liderança.',
  sabio: 'Você passou seus anos de formação viajando entre mansões e mosteiros, realizando vários bicos e serviços em troca de acesso às bibliotecas desses locais. Suas noites se resumiam a estudar livros e pergaminhos, aprendendo a sabedoria do multiverso — até mesmo os rudimentos da magia — e, agora, sua mente anseia por mais.',
  soldado:
    'Você começou a treinar para a guerra assim que atingiu a idade adulta e tem poucas lembranças preciosas da vida antes de pegar em armas. A batalha está em seu sangue. Às vezes, você se pega realizando reflexivamente os exercícios básicos de luta que aprendeu primeiro. Por fim, você coloca esse treinamento em prática no campo de batalha, protegendo o reino por meio da guerra.',
};
