import { classes } from '../../../data/rulesets/dnd2024/classes';
import { caracteristicasClasse } from '../../../data/rulesets/dnd2024/caracteristicasClasse';
import { estilosDeLuta } from '../../../data/rulesets/dnd2024/estilosDeLuta';
import { proficienciasIniciaisClasse } from '../../../data/rulesets/dnd2024/classesProficienciasIniciais';
import { proficienciasArmaArmaduraClasse } from '../../../data/rulesets/dnd2024/proficienciasArmaArmaduraClasse';
import { buscarDescricaoItem } from '../../../data/rulesets/dnd2024/buscarDescricaoItem';
import { buscarDescricaoMaestria } from '../../../data/rulesets/dnd2024/propriedadesMaestria';
import { armasParaMaestria, quantidadeMaestriaEmArma } from '../../../core/maestriaArma';
import ItemComDescricao from '../../components/ItemComDescricao';
import InfoChip from '../../components/InfoChip';
import styles from './ClasseEscolhasStep.module.css';
import type { StepProps } from './StepProps';

const MAX_PERICIAS = 2;

function rotuloItem(it: { nome: string; quantidade: number; unidade: string | null }): string {
  if (it.quantidade <= 1) return it.nome;
  return it.unidade ? `${it.nome} (${it.quantidade} ${it.unidade})` : `${it.quantidade}× ${it.nome}`;
}

export default function ClasseEscolhasStep({ selection, update }: StepProps) {
  const classe = classes.find((c) => c.nome === selection.classe);

  if (!classe) {
    return <div className="label">Volte e selecione uma classe primeiro.</div>;
  }

  const proficiencias = proficienciasIniciaisClasse[classe.id];
  const profArmaArmadura = proficienciasArmaArmaduraClasse.find((p) => p.classe === classe.nome);
  const caracteristicasNivel1 = caracteristicasClasse.filter((c) => c.classe === classe.nome && c.nivel === 1);
  const qtdMaestria = quantidadeMaestriaEmArma(classe, 1);
  const armasMaestria = qtdMaestria > 0 ? armasParaMaestria(classe) : [];

  function toggleEstiloDeLuta(nome: string) {
    update({ estiloDeLutaEscolhido: selection.estiloDeLutaEscolhido === nome ? null : nome });
  }

  function toggleMaestriaArma(nome: string) {
    const atual = selection.maestriaArmaEscolhida;
    const i = atual.indexOf(nome);
    if (i > -1) {
      update({ maestriaArmaEscolhida: atual.filter((x) => x !== nome) });
    } else if (atual.length < qtdMaestria) {
      update({ maestriaArmaEscolhida: [...atual, nome] });
    }
  }

  function togglePericia(nome: string) {
    const i = selection.periciasClasseEscolhidas.indexOf(nome);
    if (i > -1) {
      update({ periciasClasseEscolhidas: selection.periciasClasseEscolhidas.filter((x) => x !== nome) });
    } else if (selection.periciasClasseEscolhidas.length < MAX_PERICIAS) {
      update({ periciasClasseEscolhidas: [...selection.periciasClasseEscolhidas, nome] });
    }
  }

  return (
    <>
      <div className="section-title">{classe.nome}</div>
      <div className="summary-row">
        <span>Atributo Primário</span>
        <span>{classe.atributoPrimario}</span>
      </div>
      <div className="summary-row">
        <span>Dado de Vida</span>
        <span>{classe.dadoDeVida}</span>
      </div>
      <div className="summary-row">
        <span>Salvaguardas</span>
        <span>{classe.salvaguardas.join(' e ')}</span>
      </div>
      {profArmaArmadura && (
        <>
          <div className="summary-row">
            <span>Proficiência com Armas</span>
            <span>{profArmaArmadura.proficienciaArmas}</span>
          </div>
          <div className="summary-row">
            <span>Treinamento com Armadura</span>
            <span>{profArmaArmadura.treinamentoArmadura}</span>
          </div>
        </>
      )}

      <div className="section-title">Características de nível 1</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        {caracteristicasNivel1
          .filter((c) => c.nome !== 'Estilo de Luta')
          .map((c) => (
            <InfoChip key={c.nome} nome={c.nome} descricao={c.descricao} />
          ))}
      </div>

      <div className="section-title">Estilo de Luta — escolha 1</div>
      {estilosDeLuta.map((e) => (
        <div
          key={e.id}
          className={`opt-card ${selection.estiloDeLutaEscolhido === e.nome ? 'selected' : ''}`}
          style={{ padding: '10px 12px' }}
          onClick={() => toggleEstiloDeLuta(e.nome)}
        >
          <div className="opt-card-name">{e.nome}</div>
          <div className="opt-card-desc">{e.beneficios}</div>
        </div>
      ))}

      {qtdMaestria > 0 && (
        <>
          <div className="section-title">
            Maestria em Arma — escolha {qtdMaestria} ({selection.maestriaArmaEscolhida.length}/{qtdMaestria})
          </div>
          <div className="label" style={{ marginBottom: 4 }}>
            você troca 1 dessas armas a cada Descanso Longo, direto na aba Perfil.
          </div>
          {armasMaestria.map((a) => (
            <div key={a.id} className={styles.maestriaRow} onClick={() => toggleMaestriaArma(a.nome)}>
              <div
                className={`check-box ${styles.maestriaCheckBox} ${selection.maestriaArmaEscolhida.includes(a.nome) ? 'checked' : ''}`}
              />
              <div className={styles.maestriaText}>
                <span className={styles.maestriaNome}>{a.nome}</span>
                <span className={styles.maestriaDetalhe}>
                  {a.dano} · <ItemComDescricao nome={a.maestria} descricao={buscarDescricaoMaestria(a.maestria)} variante="icone" />
                </span>
              </div>
            </div>
          ))}
        </>
      )}

      {proficiencias && (
        <>
          <div className="section-title">
            Perícias — escolha {MAX_PERICIAS} ({selection.periciasClasseEscolhidas.length}/{MAX_PERICIAS})
          </div>
          {proficiencias.periciasEscolha.opcoes.map((nome) => (
            <div key={nome} className="check-row" onClick={() => togglePericia(nome)}>
              <div className={`check-box ${selection.periciasClasseEscolhidas.includes(nome) ? 'checked' : ''}`} />
              <span className="check-label">{nome}</span>
            </div>
          ))}

          <div className="section-title">Equipamento inicial — escolha uma opção</div>
          {proficiencias.equipamentoInicial.map((opcao) => (
            <div
              key={opcao.rotulo}
              className={`opt-card ${selection.equipamentoClasseEscolhido === opcao.rotulo ? 'selected' : ''}`}
              onClick={() => update({ equipamentoClasseEscolhido: opcao.rotulo as 'A' | 'B' | 'C' })}
            >
              <div className="opt-card-name">Opção {opcao.rotulo}</div>
              <div className="opt-card-desc">
                {opcao.itens.map((it, i) => (
                  <span key={it.nome}>
                    {i > 0 && ', '}
                    <ItemComDescricao nome={it.nome} descricao={buscarDescricaoItem(it.nome)} rotulo={rotuloItem(it)} />
                  </span>
                ))}
                {opcao.itens.length > 0 && opcao.ouro > 0 && `, ${opcao.ouro} PO restantes`}
                {opcao.itens.length === 0 && `${opcao.ouro} PO pra gastar como quiser na Loja`}
              </div>
            </div>
          ))}
        </>
      )}
    </>
  );
}
