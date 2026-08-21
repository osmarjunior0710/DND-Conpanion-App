import { equipamentoAventura } from './equipamentoAventura';
import { montariasVeiculos } from './montariasVeiculos';
import { armas } from './armas';
import { armaduras } from './armaduras';

const indice = new Map<string, string>();
for (const it of equipamentoAventura) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}
for (const it of montariasVeiculos) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}
for (const it of armas) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}
for (const it of armaduras) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}

/** Busca a descrição de um item pelo nome (case-insensitive). Cobre
 * Equipamento de Aventura, Montarias/Veículos, Armas e Armaduras. */
export function buscarDescricaoItem(nome: string): string | null {
  return indice.get(nome.toLowerCase().trim()) ?? null;
}
