import { useState } from 'react';
import type { Classe } from '../../../data/rulesets/dnd2024/classes';
import type { Magia } from '../../../data/rulesets/dnd2024/magias';
import { armas } from '../../../data/rulesets/dnd2024/armas';
import type { ItemMochila } from '../../../core/mochila';
import {
  espacosDeMagiaAtivos,
  truquesDoPersonagem,
  magiasPreparadasDoPersonagem,
  circulosDisponiveisParaConjurar,
} from '../../../core/magiasPersonagem';
import { classificarMagia, iconesMagia, usarMagiaTemAcaoAutomatizada } from '../../../core/classificarMagia';
import type { MagiaGratisDeInvocacao } from '../../../core/invocacoesMagiaGratis';
import MagiaComDescricao from '../../components/MagiaComDescricao';
import TickPips from '../../components/TickPips';
import { useColapsavel } from '../../hooks/useColapsavel';
import { useRoll } from '../../roll/RollContext';
import EscolherCirculoShell from '../combat/EscolherCirculoShell';
import styles from './MagiasTab.module.css';

const armasSimples = armas.filter((a) => a.categoria.includes('Simples'));
const armasMarciais = armas.filter((a) => a.categoria.includes('Marciais'));

interface MagiasTabProps {
  classe: Classe | null;
  nivel: number;
  espacosGastosPorCirculo: Record<number, number>;
  onGastarSlotCirculo: (circulo: number) => boolean;
  modAcertoConjuracao: number | null;
  conjura: boolean;
  truquesAtuais: string[];
  magiasPreparadasAtuais: string[];
  /** "Descobertas Mágicas" (Colégio do Conhecimento, nível 6) — 2
   * magias sempre preparadas, mostradas numa seção própria (não se
   * misturam com Magias Preparadas normais). */
  magiasDescobertasMagicasAtuais: string[];
  /** Livro das Sombras (Bruxo, Pacto do Tomo) — 3 truques + 2 magias
   * rituais sempre preparadas enquanto o livro existir, mesmo
   * tratamento de "Descobertas Mágicas" (seção própria, fora do
   * limite normal de Magias Preparadas). Vazio pra quem não tem
   * Pacto do Tomo. */
  livroDasSombrasAtuais: string[];
  /** `true` só quando o personagem tem a Invocação Mística Pacto do
   * Tomo — controla se o botão "Reconjurar o Livro" aparece. */
  temPactoDoTomo: boolean;
  /** `true` = já reconjurado desde o último Descanso Curto/Longo —
   * botão "Reconjurar" fica travado até o próximo descanso. */
  livroDasSombrasGasto: boolean;
  onReconjurarLivro: () => void;
  /** Invocações Místicas Fase 2 — magias concedidas "de graça" (ex:
   * Armadura de Sombras -> Armadura Arcana), derivadas das Invocações
   * atuais do personagem. Vazio pra quem não tem nenhuma desse tipo. */
  magiasGratisConcedidas: MagiaGratisDeInvocacao[];
  /** IDs de Invocações cuja magia de graça `'descansoLongo'` já foi
   * usada desde o último Descanso Longo (travadas até lá). */
  magiasGratisGastas: string[];
  onUsarMagiaGratis: (item: MagiaGratisDeInvocacao) => void;
  /** `true` só quando o personagem tem a Invocação Mística Pacto da
   * Lâmina — controla se a seção de vincular arma de pacto aparece. */
  temPactoDaLamina: boolean;
  armaDePactoAtual: ItemMochila | null;
  onVincularArmaDePacto: (nomeArma: string) => void;
  onDesvincularArmaDePacto: () => void;
  faltamTruques: number;
  faltamMagiasPreparadas: number;
  onCompletarTruques: () => void;
  onCompletarMagiasPreparadas: () => void;
}

export default function MagiasTab({
  classe,
  nivel,
  espacosGastosPorCirculo,
  onGastarSlotCirculo,
  modAcertoConjuracao,
  conjura,
  truquesAtuais,
  magiasPreparadasAtuais,
  magiasDescobertasMagicasAtuais,
  livroDasSombrasAtuais,
  temPactoDoTomo,
  livroDasSombrasGasto,
  onReconjurarLivro,
  magiasGratisConcedidas,
  magiasGratisGastas,
  onUsarMagiaGratis,
  temPactoDaLamina,
  armaDePactoAtual,
  onVincularArmaDePacto,
  onDesvincularArmaDePacto,
  faltamTruques,
  faltamMagiasPreparadas,
  onCompletarTruques,
  onCompletarMagiasPreparadas,
}: MagiasTabProps) {
  const { rolarD20 } = useRoll();
  const [telaCirculo, setTelaCirculo] = useState<{ magia: Magia; circulos: number[] } | null>(null);
  const [armaDePactoEscolhida, setArmaDePactoEscolhida] = useState('');

  if (!conjura) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 12, textAlign: 'center' }}>
        Esse personagem não tem nenhuma fonte de conjuração no momento (nem pela classe, nem por multiclasse).
      </div>
    );
  }

  const espacos = espacosDeMagiaAtivos(classe, nivel);
  const truques = truquesDoPersonagem(truquesAtuais);
  const preparadas = magiasPreparadasDoPersonagem(magiasPreparadasAtuais);
  const descobertasMagicas = magiasPreparadasDoPersonagem(magiasDescobertasMagicasAtuais);
  const livroDasSombras = magiasPreparadasDoPersonagem(livroDasSombrasAtuais);
  const [espacosExpandido, setEspacosExpandido] = useColapsavel('espacos-de-magia', true);

  function rolarAtaqueSeForMagiaDeAtaque(m: Magia) {
    if (classificarMagia(m).ataque && modAcertoConjuracao !== null) {
      rolarD20({
        label: `Ataque de Magia — ${m.nome}`,
        formula: `1d20 + ${modAcertoConjuracao}`,
        mod: modAcertoConjuracao,
      });
    }
  }

  function usarMagiaGratis(item: MagiaGratisDeInvocacao) {
    const jaGasta = item.recarga === 'descansoLongo' && magiasGratisGastas.includes(item.invocacaoId);
    if (jaGasta) return;
    onUsarMagiaGratis(item);
    rolarAtaqueSeForMagiaDeAtaque(item.magia);
  }

  function usarMagia(m: Magia) {
    if (m.circulo === 0) {
      rolarAtaqueSeForMagiaDeAtaque(m);
      return;
    }
    const circulosDisponiveis = circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo);
    if (circulosDisponiveis.length === 0) return;
    setTelaCirculo({ magia: m, circulos: circulosDisponiveis });
  }

  if (telaCirculo) {
    return (
      <EscolherCirculoShell
        magia={telaCirculo.magia}
        circulosDisponiveis={telaCirculo.circulos}
        espacos={espacos}
        espacosGastosPorCirculo={espacosGastosPorCirculo}
        onVoltar={() => setTelaCirculo(null)}
        onConjurar={(circulo) => {
          const ok = onGastarSlotCirculo(circulo);
          setTelaCirculo(null);
          if (ok) rolarAtaqueSeForMagiaDeAtaque(telaCirculo.magia);
        }}
      />
    );
  }

  // Descanso Longo sempre restaura tudo (ver FichaShell.tsx's
  // descansoLongo, reset incondicional) — `recuperaNoDescansoCurto`
  // só marca o extra: esse(s) círculo(s) TAMBÉM recuperam cedo, no
  // Curto. Por isso a mensagem é sempre binária, nunca "misto por
  // círculo": ou soma o Curto como opção extra, ou é só o Longo.
  const temCurto = espacos.some((e) => e.recuperaNoDescansoCurto);
  const avisoRecuperacao = temCurto ? 'Recupera no Descanso Curto ou Longo.' : 'Recupera no Descanso Longo.';

  return (
    <>
      {espacos.length > 0 && (
        <>
          <div className={styles.grupoHeader} onClick={() => setEspacosExpandido(!espacosExpandido)}>
            <span>Espaços de Magia</span>
            <span>{espacosExpandido ? '▾' : '▸'}</span>
          </div>
          {espacosExpandido && (
            <>
              <div className="label" style={{ margin: '0 0 var(--space-2)' }}>
                {avisoRecuperacao}
              </div>
              {espacos.map((espaco, i) => {
                const gasto = espacosGastosPorCirculo[espaco.circulo] ?? 0;
                return (
                  <div key={espaco.circulo} className={styles.espacoRow} style={i === 0 ? { borderTop: 'none' } : undefined}>
                    <span>{espaco.circulo}º círculo</span>
                    <TickPips total={espaco.maximo} usados={gasto} tamanho="lg" />
                  </div>
                );
              })}
            </>
          )}
        </>
      )}

      {magiasGratisConcedidas.length > 0 && (
        <>
          <div className="section-title">Magias das Invocações</div>
          <div className="label" style={{ marginBottom: 4 }}>
            Concedidas de graça pelas Invocações Místicas — não gastam Espaço de Pacto.
          </div>
          {magiasGratisConcedidas.map((item) => {
            const jaGasta = item.recarga === 'descansoLongo' && magiasGratisGastas.includes(item.invocacaoId);
            return (
              <div key={item.invocacaoId} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={item.magia} /> {iconesMagia(item.magia)}
                  <div style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                    {item.invocacaoNome}
                    {item.pvTemporarioConcedido !== null && ` · +${item.pvTemporarioConcedido} PV Temp`}
                  </div>
                </div>
                <span className={styles.spellCirculo}>{item.magia.circulo}º círculo</span>
                {item.recarga === 'ilimitado' && item.pvTemporarioConcedido === null ? (
                  <span className="tag">sem custo</span>
                ) : (
                  <div
                    className={`${styles.usarBtn} ${jaGasta ? styles.usarBtnDesabilitado : ''}`}
                    onClick={() => usarMagiaGratis(item)}
                  >
                    {jaGasta ? 'Usada' : 'Usar de graça'}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}

      {temPactoDaLamina && (
        <>
          <div className="section-title">Pacto da Lâmina</div>
          <div className="label" style={{ marginBottom: 4 }}>
            Como Ação Bônus, vincula uma arma Simples ou Marcial — o ataque com ela usa Carisma, não Força/Destreza.
            Aparece automaticamente na Mão Principal (aba Mochila) e no "Atacar" do Combat.
          </div>
          {armaDePactoAtual ? (
            <div className={styles.reconjurarBtn} onClick={onDesvincularArmaDePacto}>
              🗡️ Arma de Pacto: {armaDePactoAtual.nome} — toque pra desvincular
            </div>
          ) : (
            <>
              <select
                className={styles.selectArma}
                value={armaDePactoEscolhida}
                onChange={(e) => setArmaDePactoEscolhida(e.target.value)}
              >
                <option value="">Escolha a arma...</option>
                <optgroup label="Armas Simples">
                  {armasSimples.map((a) => (
                    <option key={a.id} value={a.nome}>
                      {a.nome} ({a.dano})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Armas Marciais">
                  {armasMarciais.map((a) => (
                    <option key={a.id} value={a.nome}>
                      {a.nome} ({a.dano})
                    </option>
                  ))}
                </optgroup>
              </select>
              <div
                className={`${styles.reconjurarBtn} ${!armaDePactoEscolhida ? styles.reconjurarBtnGasto : ''}`}
                onClick={() => {
                  if (!armaDePactoEscolhida) return;
                  onVincularArmaDePacto(armaDePactoEscolhida);
                  setArmaDePactoEscolhida('');
                }}
              >
                🗡️ Vincular arma de pacto
              </div>
            </>
          )}
        </>
      )}

      {(truques.length > 0 || faltamTruques > 0) && (
        <>
          <div className="section-title">Truques</div>
          {faltamTruques > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarTruques}>
              ⚠️ Faltam {faltamTruques} truque{faltamTruques > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
          {truques.map((m) => {
            const temAcao = usarMagiaTemAcaoAutomatizada(m);
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} /> {iconesMagia(m)}
                </div>
                <span className={styles.spellCirculo}>Truque</span>
                <div
                  className={`${styles.usarBtn} ${temAcao ? '' : styles.usarBtnPendencia}`}
                  onClick={() => temAcao && usarMagia(m)}
                >
                  {temAcao ? 'Usar' : 'Usar (pendência)'}
                </div>
              </div>
            );
          })}
        </>
      )}

      {descobertasMagicas.length > 0 && (
        <>
          <div className="section-title">Descobertas Mágicas</div>
          <div className="label" style={{ marginBottom: 4 }}>
            Colégio do Conhecimento — sempre preparadas, não contam na conta de Magias Preparadas.
          </div>
          {descobertasMagicas.map((m) => {
            const semEspaco = m.circulo > 0 && circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo).length === 0;
            const temAcao = usarMagiaTemAcaoAutomatizada(m);
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} /> {iconesMagia(m)}
                </div>
                <span className={styles.spellCirculo}>{m.circulo === 0 ? 'Truque' : `${m.circulo}º círculo`}</span>
                <div
                  className={`${styles.usarBtn} ${!temAcao ? styles.usarBtnPendencia : semEspaco ? styles.usarBtnDesabilitado : ''}`}
                  onClick={() => temAcao && usarMagia(m)}
                >
                  {temAcao ? 'Usar' : 'Usar (pendência)'}
                </div>
              </div>
            );
          })}
        </>
      )}

      {temPactoDoTomo && (
        <>
          <div className="section-title">Livro das Sombras</div>
          <div className="label" style={{ marginBottom: 4 }}>
            Pacto do Tomo — sempre preparadas enquanto o livro existir, não contam na conta de Magias Preparadas. A
            escolha pode ser refeita a cada Descanso Curto ou Longo.
          </div>
          <div
            className={`${styles.reconjurarBtn} ${livroDasSombrasGasto ? styles.reconjurarBtnGasto : ''}`}
            onClick={onReconjurarLivro}
          >
            🔮{' '}
            {livroDasSombrasGasto
              ? 'Livro já reconjurado — disponível de novo após Descanso Curto ou Longo'
              : 'Reconjurar o Livro das Sombras — toque pra escolher'}
          </div>
          {livroDasSombras.map((m) => {
            const semEspaco = m.circulo > 0 && circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo).length === 0;
            const temAcao = usarMagiaTemAcaoAutomatizada(m);
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} /> {iconesMagia(m)}
                </div>
                <span className={styles.spellCirculo}>{m.circulo === 0 ? 'Truque' : `${m.circulo}º círculo`}</span>
                <div
                  className={`${styles.usarBtn} ${!temAcao ? styles.usarBtnPendencia : semEspaco ? styles.usarBtnDesabilitado : ''}`}
                  onClick={() => temAcao && usarMagia(m)}
                >
                  {temAcao ? 'Usar' : 'Usar (pendência)'}
                </div>
              </div>
            );
          })}
        </>
      )}

      {(preparadas.length > 0 || faltamMagiasPreparadas > 0) && (
        <>
          <div className="section-title">Magias Preparadas</div>
          {faltamMagiasPreparadas > 0 && (
            <div className={styles.avisoFaltando} onClick={onCompletarMagiasPreparadas}>
              ⚠️ Faltam {faltamMagiasPreparadas} magia{faltamMagiasPreparadas > 1 ? 's' : ''} preparada
              {faltamMagiasPreparadas > 1 ? 's' : ''} pro seu nível — toque pra escolher
            </div>
          )}
          {preparadas.map((m) => {
            const semEspaco = circulosDisponiveisParaConjurar(m.circulo, espacos, espacosGastosPorCirculo).length === 0;
            return (
              <div key={m.id} className={styles.spellRow}>
                <div className={styles.spellName}>
                  <MagiaComDescricao magia={m} /> {iconesMagia(m)}
                </div>
                <span className={styles.spellCirculo}>{m.circulo}º círculo</span>
                <div
                  className={`${styles.usarBtn} ${semEspaco ? styles.usarBtnDesabilitado : ''}`}
                  onClick={() => usarMagia(m)}
                >
                  Usar
                </div>
              </div>
            );
          })}
        </>
      )}

      <div className="label" style={{ marginTop: 8 }}>
        Usar aqui gasta o espaço de magia de verdade (com upcast, igual a aba Combat) — útil pra conjurar fora do
        seu turno, no meio da campanha.
      </div>
    </>
  );
}
