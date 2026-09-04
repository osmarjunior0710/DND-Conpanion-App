# EmDev.md

> Plano do foco que está em andamento **agora** (ver ciclo de foco,
> seção 6 do `CLAUDE.md`). Diferente da família `DECISOES-*.md`
> (decisão já tomada, permanente) e de `PENDENCIAS.md` (adiado de
> propósito ou travado estruturalmente), este arquivo é só o checklist
> de trabalho do foco sendo executado agora.
>
> Fica vazio entre focos. Quando um foco fecha (seção 6.3), o conteúdo
> é apagado — não acumula plano antigo.

---

## Foco: Espécies (raças) — habilitar as 7 que faltam

Hoje só Anão, Orc e Pequenino estão liberadas. Conferido contra a
planilha (aba Espécies, sem mudança de estrutura) e contra o PDF do
Cap. 4 do Livro do Jogador (fornecido pelo Osmar) — o texto de
`especies.ts` bate 100% com o livro, incluindo as tabelas de
sub-escolha (Herança Dracônica, Linhagem Élfica, Linhagem Gnômica,
Ancestralidade Gigante, Legados Ínferos, Revelação Celestial). Não
falta dado, falta estruturar o texto corrido em campos próprios + tela
de escolha, espécie por espécie.

Ordem de entrega (menor/mais simples primeiro, reaproveitando padrão
sempre que possível — ver 6.1):

- [x] **1. Humano** — sem sub-escolha real, só 3 traços simples:
  - [x] Tamanho (Médio ou Pequeno) — seletor novo de 2 opções, mesmo
        padrão do "Equipamento A ou B" do `OrigemEscolhasStep.tsx`.
  - [x] Hábil (perícia à escolha) — reaproveita o padrão de checkbox
        de `TalentoOrigemEscolhasStep.tsx`.
  - [x] Versátil (talento de Origem à escolha) — reaproveita
        `TelaEscolherTalento.tsx` com `categoria="Origem"`.
  - [x] Marcar `disponivel: true` no dado, tirar do texto "(em breve)".
  - Testado com Playwright (gerador de Personagem de Teste): Humano
    aparece na lista de espécies, perícia e talento escolhidos batem
    na tela de Perfil ("Hábil — escolhida: X", "Versátil — escolhido:
    Y"). `npx tsc -b`, `npm test -- --run` (162 testes) e
    `npm run build` passando.
- [x] **2. Draconato** — piloto da natureza `identidade_permanente`:
      Herança Dracônica estruturada em `Especie.opcoesSubescolha` (novo
      campo genérico, reaproveitável pro Golias), tela de escolha das
      10 cores de dragão na "Escolhas da Espécie", Ataque de
      Sopro/Resistência a Dano resolvidos em tempo de leitura pelo tipo
      de dano da cor escolhida (`core/especieSubescolha.ts`, com
      teste) — nunca duplicado como valor fixo.
  - Testado com Playwright: wizard bloqueia avançar sem escolher a cor
    ("Complete as escolhas da espécie"), tela de escolha mostra as 10
    cores com o tipo de dano de cada uma, e a Ficha (aba Perfil) mostra
    "Herança Dracônica: Cobre"/"Azul" e "Ataque de Sopro (Tipo de dano:
    Elétrico)" resolvidos corretamente pra 2 cores diferentes. `npx tsc
    -b`, `npm test -- --run` (164 testes) e `npm run build` passando.
- [ ] **3. Golias** — mesma natureza `identidade_permanente`,
      reaproveitando o padrão do Draconato (Ancestralidade Gigante, 5
      opções com usos = Bônus de Proficiência).
- [ ] **4. Elfo** — piloto da natureza `linhagem_com_progressao_magica`:
      Linhagem Élfica (3 opções), magia de círculo superior automática
      nos níveis 3 e 5 — precisa "conversar" com o motor de level-up.
- [ ] **5. Gnomo** — mesma natureza, versão mais simples (Linhagem
      Gnômica, 2 opções, só nível 1, sem progressão 3/5).
- [ ] **6. Tiferino** — mesma natureza, reaproveitando o padrão de
      Elfo/Gnomo (Legados Ínferos, 3 opções, progressão 3/5 como Elfo).
- [ ] **7. Aasimar** — natureza `escolha_reutilizavel` (Revelação
      Celestial): não é escolha do wizard, é escolha repetida toda vez
      que a habilidade é usada em combate. **Perguntar ao Osmar onde
      fica e como o jogador ativa antes de codar** (regra do
      `LICOES-RAPIDAS.md`), deixado por último de propósito por causa
      disso.


## Auditoria de Conteúdo — Descrição Completa × Curta (Armas, Armaduras, Equipamento de Aventura, Itens Mágicos)

> Segunda frente aberta em paralelo ao foco de Espécies acima (ver
> seção 6 do CLAUDE.md sobre não deixar 2 planos simultâneos sem
> confirmar com o Osmar qual está valendo). Ver `AUDITORIA-CONTEUDO.md`
> pro plano de fundo completo desta frente.

Fonte dos livros: Google Drive (autorizado pelo Osmar nesta entrega,
exceção à regra normal de "só a planilha" — Cap.6 Equipamento do Livro
do Jogador cobre Armas/Armaduras/Equipamento de Aventura; Cap.7 Tesouro
Parte 2 do Livro do Mestre cobre Itens Mágicos). Decisões tomadas com o
Osmar: `descricaoCompleta` entra tanto na planilha (`dnd-master-referencia.xlsx`,
coluna nova por aba) quanto direto em `src/data/`; toda correção de
dado achada contra o livro é aplicada nos dois lugares (xlsx + `.ts`) e
listada no reporte, sem esperar aprovação prévia por item.

- [x] **Armaduras (13 itens) — piloto, FEITA.** Conferido: todos os
      valores de tabela (CA/Força mínima/Furtividade/Peso/Custo) batem
      100% com o Cap.6 do Livro do Jogador — zero correção necessária.
      Achado importante: o livro **não tem parágrafo de descrição por
      armadura** (só a tabela + regras gerais de Categoria/Treinamento/
      Furtividade/Força) — diferente de Magias. Decisão do Osmar:
      `descricaoCompleta` de Armas/Armaduras é texto PRÓPRIO (não
      literal) juntando a linha da tabela com a consequência mecânica
      de cada regra (ex: Força mínima não atingida reduz deslocamento
      em 3m — texto que não existia antes em lugar nenhum do app).
      `armaduras.ts` ganhou `descricaoCompleta`/`descricaoCurta`
      (renomeado de `descricao`); planilha ganhou coluna "Descrição
      Completa" na aba Armaduras. `buscarDescricaoItem.ts` ganhou
      `buscarDescricaoCompletaItem`; `ItemComDescricao.tsx` ganhou
      toggle Desc. curta/longa (mesmo padrão do `MagiaComDescricao`,
      antes só usado por Magias); `MochilaTab.tsx` já passa a completa
      pro popup de Armadura. `npm test` (160 passando) e `npm run
      build` OK.
- [x] **Armas (38 itens) — FEITA.** Confirmado: mesmo achado de
      Armaduras — livro só tem tabela + seções "Propriedades"/
      "Propriedades de Maestria" (sem parágrafo por arma). Todos os 38
      valores de tabela batiam com o livro, exceto 2 vírgulas sobrando
      de extração (Espada Curta "Dano", Dardo "Propriedades") —
      corrigidas na planilha e no `.ts`. `descricaoCompleta` gerada por
      script (não digitada arma por arma) juntando categoria + dano +
      explicação de cada propriedade/maestria específica. Mesmo padrão
      de `armaduras.ts` (completa/curta + coluna nova na planilha).
      `npm test` (160 passando) e `npm run build` OK.
- [x] **Equipamento de Aventura (98 itens) — FEITA.** Confirmado: o
      livro TEM texto próprio por item em ordem alfabética (Cap.6 do
      Livro do Jogador) — `descricaoCompleta` aqui é literal, igual
      Magias (diferente de Armas/Armaduras). 4 grupos de variantes
      (Foco Arcano, Foco Druídico, Munição, Símbolo Sagrado — 16 itens
      no total) compartilham 1 parágrafo entre as variantes da mesma
      tabela, também literal. Extração via script (não digitado à
      mão): localiza cada cabeçalho MAIÚSCULO no texto do capítulo,
      corta o trecho até o próximo cabeçalho, remove hifenização de
      quebra de linha do PDF e 1 legenda de imagem solta (Fogo
      Alquímico). Achado curioso: o próprio livro tem uma errata no
      verbete "Pote" (diz "Um Frasco armazena..." em vez de "Um
      Pote...") — preservado literal, reportado ao Osmar, não é bug
      nosso de extração. Todos os valores de Peso/Custo já batiam com
      o livro, nenhuma correção necessária. `npm test` (160 passando)
      e `npm run build` OK.
- [ ] **Itens Mágicos (288 itens) — em andamento, lotes de 50 (pedido
      do Osmar).** Fonte real é 3 PDFs juntos (Livro do Mestre Cap.7
      Tesouro "Parte 1/2/3" — o catálogo alfabético atravessa a divisão
      de arquivos do Osmar, confirmado com `pypdf`/`pymupdf` já que o
      `read_file_content` do Drive trunca PDF grande silenciosamente).
      Além de completa/curta, ganhou classificação derivada acordada
      com o Osmar (`AUDITORIA-CONTEUDO.md` seção 4.1): `tipoItem`
      (arma/armadura/escudo/consumivel/passivo/ativo-com-carga),
      `bonusItem` (+N de arma/armadura/escudo) e `cargas` — só no
      `itensMagicos.ts`, não na planilha (é leitura/julgamento, não
      dado bruto do livro).
  - [x] **Lote 1 (50 itens, "Poção de Escalar" → "Manto da Arraia") —
        FEITA.** `descricaoCompleta` extraída (script, cabeçalho
        "NOME\nCategoria, Raridade" — formato diferente do Cap.6).
        Achado: 9 itens (Estátua de Poderes Incríveis) compartilham 1
        parágrafo mestre com sub-parágrafo próprio por nome ("Nome
        (Raridade). texto...") — extração teve bug 2x (nome repetido
        no texto vazou pro item errado; último item da lista sem
        próximo cabeçalho vazou até o fim do capítulo) — os DOIS
        casos foram achados por conferência de tamanho (outlier
        gigante) e corrigidos, não passaram batido. **2 correções de
        dado reais**: Botas do Inverno e Luvas de Nadar e Escalar
        exigem sintonização no livro, planilha tinha "não" — corrigido
        na planilha e no `.ts`. **5 itens ficaram com `tipoItem: null`**
        de propósito (Baralho das Ilusões, Bastão Imóvel, Cajado da
        Píton, Cajado da Víbora, Corda de Escalada) — mecânica própria
        demais pro balde de 6 categorias (viram criatura controlada
        com bloco de estatística, ou têm CA/PV próprios) — não forcei
        classificação errada, ver `PENDENCIAS.md`. `npm test` (164
        passando) e `npm run build` OK.
  - [x] **Lote 2 (itens 51-100) — FEITA.** Achou e corrigiu **2 bugs
        novos de extração** que afetavam itens fora deste lote (não
        pegos na conferência do Lote 1 porque só apareciam ao processar
        os cabeçalhos vizinhos certos): "Unguento de Keoghtom" tinha
        vazado o texto de "Varinha das Maravilhas" — livro escreve
        "MARAVILLHAS" com erro de digitação, diferente da grafia da
        planilha, então o cabeçalho da Varinha não foi reconhecido
        como fronteira; "Anel de Cativar Animais" tinha vazado a seção
        inteira de "Anel de Comandar Elementais" (grupo adiado pro
        Lote 6 — excluir da busca também removeu ele como fronteira,
        corrigido incluindo o cabeçalho como fronteira mesmo sem
        atribuir texto ainda). De brinde, corrigido também o
        "Vingadora Sagrada" (não está neste lote, mas mesma classe de
        bug do "Veneno Básico" em Equipamento — é o último item
        alfabético do catálogo, vazou até a próxima seção do livro).
        **1 correção de dado real**: Anel de Queda Suave exige
        sintonização no livro, planilha tinha "não". `npm test` (164
        passando) e `npm run build` OK.
  - [ ] **Lote 3 (itens 101-150)**
  - [ ] **Lote 4 (itens 151-200)**
  - [ ] **Lote 5 (itens 201-250)**
  - [ ] **Lote 6 (itens 251-288)** — inclui as famílias compostas
        adiadas do Lote 1 (Pedra Iônica ~14 variantes, Anel de
        Comandar Elementais ~4, Poção de Cura (geral), Poção de Força
        do Gigante (geral) — todas Raro+/Variável, não caem em lotes
        anteriores por ordem alfabética/raridade da planilha, conferir
        na hora).
- [ ] Depois de Itens Mágicos completo, avaliar se cabe uma entrada
      nova em `DECISOES-DADOS.md` sobre o padrão "Completa nem sempre é
      texto literal — depende se o livro tem prosa individual pro tipo
      de conteúdo" + o padrão de classificação derivada (tipoItem/
      bonusItem/cargas) pra próximo catálogo parecido.
