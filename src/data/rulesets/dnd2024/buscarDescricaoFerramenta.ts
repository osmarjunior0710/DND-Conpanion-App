import { gruposFerramenta, descricaoFerramentaFixa } from './ferramentas';

const mapa = new Map<string, string>();
for (const grupo of Object.values(gruposFerramenta)) {
  for (const opcao of grupo) {
    if (opcao.descricao) mapa.set(opcao.nome.toLowerCase(), opcao.descricao);
  }
}
for (const [nome, descricao] of Object.entries(descricaoFerramentaFixa)) {
  mapa.set(nome.toLowerCase(), descricao);
}

export function buscarDescricaoFerramenta(nome: string): string | null {
  return mapa.get(nome.toLowerCase()) ?? null;
}
