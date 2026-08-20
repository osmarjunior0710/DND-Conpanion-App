// Gerado a partir de dnd-master-referencia.xlsx, aba "Ferramentas"
// (coluna "Variantes" pra Instrumento Musical/Kit de Jogos; linhas da
// categoria "Ferramentas de Artesão" pra esse grupo). Não editar à mão.

export interface OpcaoFerramenta {
  nome: string;
  preco: string | null;
  peso: string | null;
}

export const gruposFerramenta: Record<string, OpcaoFerramenta[]> = {
  "Instrumento Musical": [
    { nome: "Alaúde", preco: "35 PO", peso: "1 kg" },
    { nome: "Flauta", preco: "2 PO", peso: "0,5 kg" },
    { nome: "Flauta de Pan", preco: "12 PO", peso: "1 kg" },
    { nome: "Gaita de Foles", preco: "30 PO", peso: "3 kg" },
    { nome: "Lira", preco: "30 PO", peso: "1 kg" },
    { nome: "Oboé", preco: "2 PO", peso: "0,5 kg" },
    { nome: "Tambor", preco: "6 PO", peso: "1,5 kg" },
    { nome: "Trombeta", preco: "3 PO", peso: "1 kg" },
    { nome: "Violino", preco: "30 PO", peso: "0,5 kg" },
    { nome: "Xilofone", preco: "25 PO", peso: "5 kg" },
  ],
  "Kit de Jogos": [
    { nome: "Dados", preco: "1 PP", peso: null },
    { nome: "Xadrez-do-Dragão", preco: "1 PO", peso: null },
    { nome: "Baralho", preco: "5 PP", peso: null },
    { nome: "Conjunto do Jogo dos Três Dragões", preco: "1 PO", peso: null },
  ],
  "Ferramentas de Artesão": [
    { nome: "Ferramentas de Ferreiro", preco: "20 PO", peso: "4 kg" },
    { nome: "Ferramentas de Funileiro", preco: "50 PO", peso: "5 kg" },
    { nome: "Ferramentas de Carpinteiro", preco: "8 PO", peso: "3 kg" },
    { nome: "Ferramentas de Cartógrafo", preco: "15 PO", peso: "3 kg" },
    { nome: "Ferramentas de Joalheiro", preco: "25 PO", peso: "1 kg" },
    { nome: "Ferramentas de Oleiro", preco: "10 PO", peso: "1,5 kg" },
    { nome: "Ferramentas de Coureiro", preco: "5 PO", peso: "2,5 kg" },
    { nome: "Ferramentas de Pedreiro", preco: "10 PO", peso: "4 kg" },
    { nome: "Ferramentas de Entalhador", preco: "1 PO", peso: "2,5 kg" },
    { nome: "Ferramentas de Sapateiro", preco: "5 PO", peso: "2,5 kg" },
    { nome: "Ferramentas de Tecelão", preco: "1 PO", peso: "2,5 kg" },
    { nome: "Ferramentas de Navegador", preco: "25 PO", peso: "1 kg" },
    { nome: "Ferramentas de Vidreiro", preco: "30 PO", peso: "2,5 kg" },
    { nome: "Suprimentos de Alquimista", preco: "50 PO", peso: "4 kg" },
    { nome: "Suprimentos de Calígrafo", preco: "10 PO", peso: "2,5 kg" },
    { nome: "Suprimentos de Cervejeiro", preco: "20 PO", peso: "4,5 kg" },
    { nome: "Suprimentos de Pintor", preco: "10 PO", peso: "2,5 kg" },
    { nome: "Utensílios de Cozinheiro", preco: "1 PO", peso: "4 kg" },
  ],
};
