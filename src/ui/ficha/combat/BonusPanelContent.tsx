import type { AtaqueResolvido } from '../../../core/ataque';
import TickPips from '../../components/TickPips';
import styles from './PanelRows.module.css';

interface BonusPanelContentProps {
  usosFolegoMaximo: number;
  usosFolegoRestantes: number;
  onUsarRecuperarFolego: () => void;
  ataqueBonus: AtaqueResolvido | null;
  onUsarAtaqueBonus: () => void;
  usosInspiracaoMaximo: number;
  usosInspiracaoRestantes: number;
  tamanhoDadoInspiracao: number;
  fonteDeInspiracao: boolean;
  temEspacoDisponivel: boolean;
  /** Círculo que `onRecuperarInspiracaoComEspaco` vai gastar de
   * verdade (o de menor círculo com sobra) — `null` se não tiver
   * nenhum espaço disponível. */
  proximoCirculoParaGastar: number | null;
  onUsarInspiracao: () => void;
  onRecuperarInspiracaoComEspaco: () => void;
  detalhesAtivo: boolean;
  /** Conhecimento de Pedras (Anão) — 0 = espécie não é Anão. */
  usosConhecimentoDePedrasMaximo: number;
  usosConhecimentoDePedrasRestantes: number;
  onUsarConhecimentoDePedras: () => void;
  /** Pico de Adrenalina (Orc) — 0 = espécie não é Orc. */
  usosPicoDeAdrenalinaMaximo: number;
  usosPicoDeAdrenalinaRestantes: number;
  onUsarPicoDeAdrenalina: () => void;
}

export default function BonusPanelContent({
  usosFolegoMaximo,
  usosFolegoRestantes,
  onUsarRecuperarFolego,
  ataqueBonus,
  onUsarAtaqueBonus,
  usosInspiracaoMaximo,
  usosInspiracaoRestantes,
  tamanhoDadoInspiracao,
  fonteDeInspiracao,
  temEspacoDisponivel,
  proximoCirculoParaGastar,
  onUsarInspiracao,
  onRecuperarInspiracaoComEspaco,
  detalhesAtivo,
  usosConhecimentoDePedrasMaximo,
  usosConhecimentoDePedrasRestantes,
  onUsarConhecimentoDePedras,
  usosPicoDeAdrenalinaMaximo,
  usosPicoDeAdrenalinaRestantes,
  onUsarPicoDeAdrenalina,
}: BonusPanelContentProps) {
  if (
    usosFolegoMaximo === 0 &&
    usosInspiracaoMaximo === 0 &&
    usosConhecimentoDePedrasMaximo === 0 &&
    usosPicoDeAdrenalinaMaximo === 0 &&
    !ataqueBonus
  ) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 12, textAlign: 'center' }}>
        Nenhuma ação bônus disponível pra este personagem no nível atual.
      </div>
    );
  }

  const semUsos = usosFolegoRestantes <= 0;
  const semUsosInspiracao = usosInspiracaoRestantes <= 0;
  const nadaParaRecuperar = usosInspiracaoRestantes >= usosInspiracaoMaximo;
  const recuperarDesabilitado = !temEspacoDisponivel || nadaParaRecuperar;

  return (
    <>
      {usosInspiracaoMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Inspiração de Bardo (d{tamanhoDadoInspiracao}):</span>
            <TickPips total={usosInspiracaoMaximo} usados={usosInspiracaoMaximo - usosInspiracaoRestantes} />
            <span style={{ color: 'var(--text-faint)' }}>
              {usosInspiracaoRestantes}/{usosInspiracaoMaximo} disponíveis
            </span>
          </div>
          <div
            className={styles.row}
            style={semUsosInspiracao ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            onClick={onUsarInspiracao}
          >
            <div className={styles.rowName}>🎵 Inspiração de Bardo</div>
            {detalhesAtivo && (
              <div className={styles.rowDesc}>
                Concede 1 dado de Inspiração (d{tamanhoDadoInspiracao}) a uma criatura que veja/ouça você a até 18m.
                Gasta 1 uso — recupera tudo no Descanso Longo
                {fonteDeInspiracao ? ' (e no Curto, com Fonte de Inspiração)' : ''}.
              </div>
            )}
          </div>
          {fonteDeInspiracao && (
            <div
              className={styles.row}
              style={recuperarDesabilitado ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              onClick={onRecuperarInspiracaoComEspaco}
            >
              <div className={styles.rowName}>🔁 Fonte de Inspiração</div>
              <div className={styles.rowDesc}>Recupera Inspiração com Espaço de Magia</div>
              {detalhesAtivo && (
                <div className={styles.rowDesc}>
                  Sem ação necessária — gasta 1 Espaço de Magia pra recuperar 1 uso gasto de Inspiração de Bardo
                  (Fonte de Inspiração).
                </div>
              )}
              {proximoCirculoParaGastar !== null && (
                <div className={styles.rowDesc} style={{ color: 'var(--text-faint)' }}>
                  Espaço de magia do {proximoCirculoParaGastar}º círculo será gasto.
                </div>
              )}
            </div>
          )}
          {semUsosInspiracao && (
            <div className="label" style={{ marginTop: 2, marginBottom: 6 }}>
              sem usos de Inspiração disponíveis — descanse pra recuperar
              {fonteDeInspiracao && temEspacoDisponivel ? ' ou gaste um Espaço de Magia acima' : ''}.
            </div>
          )}
        </>
      )}
      {ataqueBonus && (
        <div className={styles.row} onClick={onUsarAtaqueBonus}>
          <div className={styles.rowName}>🗡 Atacar — {ataqueBonus.nome} (Mão Secundária)</div>
          <div className={styles.rowDesc}>
            {ataqueBonus.descricao}
            {detalhesAtivo && ' Propriedade Leve nas duas mãos: sem bônus de atributo no dano (a menos que seja negativo).'}
          </div>
        </div>
      )}
      {usosFolegoMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Recuperar Fôlego:</span>
            <TickPips total={usosFolegoMaximo} usados={usosFolegoMaximo - usosFolegoRestantes} />
            <span style={{ color: 'var(--text-faint)' }}>
              {usosFolegoRestantes}/{usosFolegoMaximo} disponíveis
            </span>
          </div>
          <div
            className={styles.row}
            style={semUsos ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            onClick={onUsarRecuperarFolego}
          >
            <div className={styles.rowName}>🩹 Recuperar Fôlego</div>
            {detalhesAtivo && (
              <div className={styles.rowDesc}>
                Recupera 1d10 + seu nível de Guerreiro em Pontos de Vida. Gasta 1 uso — 1 volta no Descanso Curto,
                todos no Descanso Longo.
              </div>
            )}
          </div>
          {semUsos && (
            <div className="label" style={{ marginTop: 6 }}>
              sem usos disponíveis — descanse pra recuperar.
            </div>
          )}
        </>
      )}
      {usosConhecimentoDePedrasMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Conhecimento de Pedras:</span>
            <TickPips total={usosConhecimentoDePedrasMaximo} usados={usosConhecimentoDePedrasMaximo - usosConhecimentoDePedrasRestantes} />
            <span style={{ color: 'var(--text-faint)' }}>
              {usosConhecimentoDePedrasRestantes}/{usosConhecimentoDePedrasMaximo} disponíveis
            </span>
          </div>
          <div
            className={styles.row}
            style={usosConhecimentoDePedrasRestantes <= 0 ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            onClick={onUsarConhecimentoDePedras}
          >
            <div className={styles.rowName}>🪨 Conhecimento de Pedras</div>
            {detalhesAtivo && (
              <div className={styles.rowDesc}>
                Adquire Sismiconsciência (18m) por 10 minutos — precisa estar em/tocando pedra. Gasta 1 uso, todos
                voltam no Descanso Longo.
              </div>
            )}
          </div>
          {usosConhecimentoDePedrasRestantes <= 0 && (
            <div className="label" style={{ marginTop: 6 }}>
              sem usos disponíveis — descanse pra recuperar.
            </div>
          )}
        </>
      )}
      {usosPicoDeAdrenalinaMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Pico de Adrenalina:</span>
            <TickPips total={usosPicoDeAdrenalinaMaximo} usados={usosPicoDeAdrenalinaMaximo - usosPicoDeAdrenalinaRestantes} />
            <span style={{ color: 'var(--text-faint)' }}>
              {usosPicoDeAdrenalinaRestantes}/{usosPicoDeAdrenalinaMaximo} disponíveis
            </span>
          </div>
          <div
            className={styles.row}
            style={usosPicoDeAdrenalinaRestantes <= 0 ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
            onClick={onUsarPicoDeAdrenalina}
          >
            <div className={styles.rowName}>⚡ Pico de Adrenalina</div>
            {detalhesAtivo && (
              <div className={styles.rowDesc}>
                Executa a ação Correr como Ação Bônus e concede PV Temporário igual ao seu Bônus de Proficiência.
                Gasta 1 uso — todos voltam no Descanso Curto ou Longo.
              </div>
            )}
          </div>
          {usosPicoDeAdrenalinaRestantes <= 0 && (
            <div className="label" style={{ marginTop: 6 }}>
              sem usos disponíveis — descanse pra recuperar.
            </div>
          )}
        </>
      )}
    </>
  );
}
