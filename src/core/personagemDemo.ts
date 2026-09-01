// "Garante que existe" pro personagem fixo de demonstração — a UI
// (FichaShell.tsx) chama isso em vez de `armazenamentoPersonagens.buscar`
// direto quando o id da URL é `ID_PERSONAGEM_DEMO`. Fica em `core/`
// (não em `data/`) porque tem efeito colateral (grava no
// armazenamento) — `data/personagemDemo.ts` só guarda o dado
// congelado, zero lógica.

import { personagemDemo, ID_PERSONAGEM_DEMO } from '../data/personagemDemo';
import { armazenamentoPersonagens, type PersonagemSalvo } from './armazenamentoPersonagens';

export { ID_PERSONAGEM_DEMO };

/** Devolve o personagem fixo de demonstração, criando-o no
 * armazenamento local se essa for a primeira visita nesse navegador
 * (garante que `/ficha/{ID_PERSONAGEM_DEMO}` sempre leva a alguém,
 * mesmo em um navegador que nunca abriu o app antes). */
export function garantirPersonagemDemo(): PersonagemSalvo {
  const existente = armazenamentoPersonagens.buscar(ID_PERSONAGEM_DEMO);
  if (existente) return existente;
  armazenamentoPersonagens.salvar(personagemDemo);
  return personagemDemo;
}
