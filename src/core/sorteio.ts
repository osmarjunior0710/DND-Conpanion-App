// Sorteio genérico — usado por qualquer ferramenta de desenvolvimento/
// teste que precisa escolher valores aleatoriamente (Personagem de
// Teste, Level Up Rápido). Zero regra de D&D aqui, só utilitário.

export function embaralhar<T>(lista: T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export function sorteiaUm<T>(lista: T[]): T | null {
  if (lista.length === 0) return null;
  return lista[Math.floor(Math.random() * lista.length)];
}
