// Dados de combate FIXOS pra Fase 0 — as 12 ações do Cap. 1 e as 5
// magias de exemplo do Bruxo Tiefling do wireframe.

export interface AcaoBase {
  nome: string;
  desc: string;
  icone: string;
}

export const acoesBase: AcaoBase[] = [
  { nome: 'Ajudar', desc: 'Ajuda o teste de atributo/ataque de outra criatura, ou presta primeiros socorros', icone: '🤝' },
  { nome: 'Analisar', desc: 'Teste de Inteligência (Arcanismo, História, Investigação, Natureza ou Religião)', icone: '🔍' },
  { nome: 'Correr', desc: 'Ganha movimento adicional igual ao seu Deslocamento', icone: '🏃‍♂️' },
  { nome: 'Esconder', desc: 'Teste de Destreza (Furtividade)', icone: '🫥' },
  { nome: 'Esquivar', desc: 'Ataques contra você têm Desvantagem; suas salvaguardas de Destreza ganham Vantagem', icone: '🛡' },
  { nome: 'Influenciar', desc: 'Teste de Carisma (Atuação, Enganação, Intimidação, Persuasão) ou Sabedoria (Lidar com Animais)', icone: '💬' },
  { nome: 'Preparar', desc: 'Prepara uma ação para executar em resposta a um gatilho definido por você', icone: '⏳' },
  { nome: 'Procurar', desc: 'Teste de Sabedoria (Intuição, Medicina, Percepção ou Sobrevivência)', icone: '👁' },
  { nome: 'Usar Objeto', desc: 'Utilizar um objeto não mágico', icone: '🎒' },
];

export interface MagiaExemplo {
  nome: string;
  tipo: string;
  circulo: number;
  descricao: string;
}

export const magiasExemplo: MagiaExemplo[] = [
  { nome: 'Chicote das Trevas', tipo: 'Truque · Ação', circulo: 0, descricao: 'Ataque à distância: 1d20 + 4 pra acertar, 1d4 + 3 de dano necrótico.' },
  { nome: 'Fogo Fátuo', tipo: 'Truque · Ação', circulo: 0, descricao: 'Ataque à distância: 1d20 + 4 pra acertar, 1d4 de dano de fogo.' },
  { nome: 'Enfeitiçar Pessoa', tipo: '1º círculo · Ação', circulo: 1, descricao: 'O alvo faz um teste de resistência de Sabedoria (CD 13).' },
  { nome: 'Escudo Arcano', tipo: '1º círculo · Reação', circulo: 1, descricao: '+5 na CA até o início do seu próximo turno.' },
  { nome: 'Mãos Flamejantes', tipo: '1º círculo · Ação', circulo: 1, descricao: 'O alvo faz um teste de resistência de Destreza (CD 13).' },
];

export const espacosMagiaExemplo = { maximo: 1 };
