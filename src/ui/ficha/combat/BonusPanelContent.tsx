import type { AtaqueResolvido } from '../../../core/ataque';
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
  espacosGastos: number;
  espacosMaximo: number;
  onUsarInspiracao: () => void;
  onRecuperarInspiracaoComEspaco: () => void;
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
  espacosGastos,
  espacosMaximo,
  onUsarInspiracao,
  onRecuperarInspiracaoComEspaco,
}: BonusPanelContentProps) {
  if (usosFolegoMaximo === 0 && usosInspiracaoMaximo === 0 && !ataqueBonus) {
    return (
      <div className="box" style={{ padding: 14, color: 'var(--text-faint)', fontSize: 13, textAlign: 'center' }}>
        Nenhuma ação bônus disponível pra este personagem no nível atual.
      </div>
    );
  }

  const semUsos = usosFolegoRestantes <= 0;
  const semUsosInspiracao = usosInspiracaoRestantes <= 0;
  const semEspacoParaRecuperar = espacosMaximo - espacosGastos <= 0;
  const nadaParaRecuperar = usosInspiracaoRestantes >= usosInspiracaoMaximo;
  const recuperarDesabilitado = semEspacoParaRecuperar || nadaParaRecuperar;

  return (
    <>
      {usosInspiracaoMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Inspiração de Bardo (d{tamanhoDadoInspiracao}):</span>
            {Array.from({ length: usosInspiracaoMaximo }).map((_, i) => (
              <div key={i} className={`${styles.slotPipLg} ${i >= usosInspiracaoRestantes ? styles.slotPipLgGasto : ''}`} />
            ))}
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
            <div className={styles.rowDesc}>
              Concede 1 dado de Inspiração (d{tamanhoDadoInspiracao}) a uma criatura que veja/ouça você a até 18m.
              Gasta 1 uso — recupera tudo no Descanso Longo
              {fonteDeInspiracao ? ' (e no Curto, com Fonte de Inspiração)' : ''}.
            </div>
          </div>
          {fonteDeInspiracao && (
            <div
              className={styles.row}
              style={recuperarDesabilitado ? { opacity: 0.5, pointerEvents: 'none' } : undefined}
              onClick={onRecuperarInspiracaoComEspaco}
            >
              <div className={styles.rowName}>🔁 Recuperar Inspiração com Espaço de Magia</div>
              <div className={styles.rowDesc}>
                Sem ação necessária — gasta 1 Espaço de Magia pra recuperar 1 uso gasto de Inspiração de Bardo
                (Fonte de Inspiração).
              </div>
            </div>
          )}
          {semUsosInspiracao && (
            <div className="label" style={{ marginTop: 2, marginBottom: 6 }}>
              sem usos de Inspiração disponíveis — descanse pra recuperar
              {fonteDeInspiracao && !semEspacoParaRecuperar ? ' ou gaste um Espaço de Magia acima' : ''}.
            </div>
          )}
        </>
      )}
      {ataqueBonus && (
        <div className={styles.row} onClick={onUsarAtaqueBonus}>
          <div className={styles.rowName}>🗡 Atacar — {ataqueBonus.nome} (Mão Secundária)</div>
          <div className={styles.rowDesc}>
            {ataqueBonus.descricao} Propriedade Leve nas duas mãos: sem bônus de atributo no dano (a menos que seja
            negativo).
          </div>
        </div>
      )}
      {usosFolegoMaximo > 0 && (
        <>
          <div className={styles.slotCounter}>
            <span>Recuperar Fôlego:</span>
            {Array.from({ length: usosFolegoMaximo }).map((_, i) => (
              <div key={i} className={`${styles.slotPipLg} ${i >= usosFolegoRestantes ? styles.slotPipLgGasto : ''}`} />
            ))}
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
            <div className={styles.rowDesc}>
              Recupera 1d10 + seu nível de Guerreiro em Pontos de Vida. Gasta 1 uso — 1 volta no Descanso Curto, todos
              no Descanso Longo.
            </div>
          </div>
          {semUsos && (
            <div className="label" style={{ marginTop: 6 }}>
              sem usos disponíveis — descanse pra recuperar.
            </div>
          )}
        </>
      )}
    </>
  );
}
