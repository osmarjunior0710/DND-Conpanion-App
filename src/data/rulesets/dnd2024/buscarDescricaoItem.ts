import { equipamentoAventura } from './equipamentoAventura';
import { montariasVeiculos } from './montariasVeiculos';

const indice = new Map<string, string>();
for (const it of equipamentoAventura) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}
for (const it of montariasVeiculos) {
  if (it.descricao) indice.set(it.nome.toLowerCase(), it.descricao);
}

/** Busca a descrição de um item pelo nome (case-insensitive). Cobre hoje
 * Equipamento de Aventura e Montarias/Veículos — Armas e Armaduras ainda
 * não foram importadas (ver PENDENCIAS.md). */
export function buscarDescricaoItem(nome: string): string | null {
  return indice.get(nome.toLowerCase().trim()) ?? null;
}
