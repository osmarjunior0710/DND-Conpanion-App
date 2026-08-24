import { equipamentoAventura } from './equipamentoAventura';
import { montariasVeiculos } from './montariasVeiculos';
import { armas } from './armas';
import { armaduras } from './armaduras';
import { gruposFerramenta } from './ferramentas';

const indiceDescricao = new Map<string, string>();
const indicePeso = new Map<string, string>();

for (const it of equipamentoAventura) {
  if (it.descricao) indiceDescricao.set(it.nome.toLowerCase(), it.descricao);
  if (it.peso) indicePeso.set(it.nome.toLowerCase(), it.peso);
}
for (const it of montariasVeiculos) {
  if (it.descricao) indiceDescricao.set(it.nome.toLowerCase(), it.descricao);
}
for (const it of armas) {
  if (it.descricao) indiceDescricao.set(it.nome.toLowerCase(), it.descricao);
  if (it.peso) indicePeso.set(it.nome.toLowerCase(), it.peso);
}
for (const it of armaduras) {
  if (it.descricao) indiceDescricao.set(it.nome.toLowerCase(), it.descricao);
  if (it.peso) indicePeso.set(it.nome.toLowerCase(), it.peso);
}
for (const grupo of Object.values(gruposFerramenta)) {
  for (const it of grupo) {
    if (it.descricao) indiceDescricao.set(it.nome.toLowerCase(), it.descricao);
    if (it.peso) indicePeso.set(it.nome.toLowerCase(), it.peso);
  }
}

/** Busca a descrição de um item pelo nome (case-insensitive). Cobre
 * Equipamento de Aventura, Montarias/Veículos, Armas, Armaduras e
 * Ferramentas (grupos de escolha). */
export function buscarDescricaoItem(nome: string): string | null {
  return indiceDescricao.get(nome.toLowerCase().trim()) ?? null;
}

/** Busca o peso de um item pelo nome (case-insensitive). `null` quando
 * o item não tem peso cadastrado na planilha (lacuna real de dado —
 * ver PENDENCIAS.md) ou não foi encontrado. */
export function buscarPesoItem(nome: string): string | null {
  return indicePeso.get(nome.toLowerCase().trim()) ?? null;
}
