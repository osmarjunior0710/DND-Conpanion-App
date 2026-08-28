const iconeModulos = import.meta.glob('../../assets/icones-classes/*.png', {
  eager: true,
  import: 'default',
}) as Record<string, string>;

function iconePng(id: string): string | undefined {
  const entrada = Object.entries(iconeModulos).find(([caminho]) => caminho.endsWith(`/${id}.png`));
  return entrada?.[1];
}

function bannerPng(id: string): string | undefined {
  const entrada = Object.entries(iconeModulos).find(([caminho]) => caminho.endsWith(`/${id}-banner.png`));
  return entrada?.[1];
}

interface IconeClasseProps {
  id: string;
  /** classe CSS pra caixa quando não há emblema-banner (fallback ícone
   * antigo ou 🖼) — ex: "opt-card-img". O emblema em si usa sempre
   * "opt-card-img-emblema", que já é responsivo o bastante pra
   * qualquer contexto que o reaproveite (ver DECISOES-DESIGN.md). */
  classeCaixaFallback?: string;
}

/** Emblema redondo da classe (arquivo `{id}-banner.png`) — mesmo
 * componente usado na seleção de Classe do wizard e em qualquer outro
 * lugar que precise mostrar de qual classe é o personagem (ex: Lista
 * de Personagens). Classes sem arte própria ainda usam uma cópia do
 * emblema do Guerreiro como placeholder. */
export default function IconeClasse({ id, classeCaixaFallback = 'opt-card-img' }: IconeClasseProps) {
  const banner = bannerPng(id);
  if (banner) return <img src={banner} alt="" className="opt-card-img-emblema" />;
  return <div className={classeCaixaFallback}>{iconePng(id) ? <img src={iconePng(id)} alt="" /> : '🖼'}</div>;
}
