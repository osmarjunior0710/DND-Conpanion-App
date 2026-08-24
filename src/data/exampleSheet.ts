// Itens de exemplo FIXOS pra Mochila — ainda não vêm do wizard nem da
// planilha mestra (entra na Entrega A4, itens reais de Origem/Classe/Loja).
// PV/CA/atributos/nome já vêm do personagem salvo (core/calculoPersonagem)
// desde a Entrega A3 — só o inventário continua fixo por enquanto.

export interface ItemEquipadoExemplo {
  nome: string;
  peso: string;
}

export const itensEquipadosExemplo: ItemEquipadoExemplo[] = [
  { nome: '🗡 Adaga (mão principal)', peso: '0,5 kg' },
  { nome: '🧥 Armadura de Couro', peso: '4,5 kg' },
];

export const cargaExemplo = {
  atual: 18.5,
  maxima: 40,
};
