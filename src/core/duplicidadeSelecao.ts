// Marca nomes que aparecem em 2+ dos grupos passados — usado pra avisar
// (sem bloquear) quando uma escolha da criação já foi concedida em outra
// etapa (ex: Perícia da Origem repetida na escolha de Perícia da Classe).
// Cada grupo conta seus nomes únicos 1x, então repetição DENTRO de um
// mesmo grupo não dispara aviso sozinha.
export function nomesDuplicados(...grupos: string[][]): Set<string> {
  const contagemGrupos = new Map<string, number>();
  for (const grupo of grupos) {
    for (const nome of new Set(grupo)) {
      contagemGrupos.set(nome, (contagemGrupos.get(nome) ?? 0) + 1);
    }
  }
  return new Set([...contagemGrupos.entries()].filter(([, n]) => n >= 2).map(([nome]) => nome));
}
