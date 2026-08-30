import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { armazenamentoPersonagens } from '../../core/armazenamentoPersonagens';
import { calcularPvMaximoNivel1 } from '../../core/calculoPersonagem';
import { classes } from '../../data/rulesets/dnd2024/classes';
import { subclasses } from '../../data/rulesets/dnd2024/subclasses';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import IconeClasse from '../components/IconeClasse';
import PersonagemTesteModal from './PersonagemTesteModal';
import styles from './CharacterList.module.css';

const PALAVRA_CONFIRMACAO = 'apagar';

export default function CharacterList() {
  const navigate = useNavigate();
  const [, setVersao] = useState(0);
  const [alvoApagar, setAlvoApagar] = useState<{ id: string; nome: string } | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');
  const [modalTesteAberto, setModalTesteAberto] = useState(false);
  useLockBodyScroll(alvoApagar !== null);

  const personagens = armazenamentoPersonagens.listar().map((p) => {
    const classeId = classes.find((c) => c.nome === p.selecao.classe)?.id ?? null;
    // Prioridade do ícone: imagem do jogador ([PH] — upload ainda não
    // existe, ver PENDENCIAS.md) > subclasse da classe de maior nível
    // (mais "evoluído") > classe de maior nível > empate de nível,
    // classe mais atual. Hoje só existe 1 classe por personagem, então
    // a comparação de "maior nível"/"mais atual" não tem o que
    // desempatar ainda — a lógica já fica pronta pra quando
    // multiclasse existir.
    const subclasseId = p.subclasseAtual
      ? (subclasses.find((s) => s.nome === p.subclasseAtual)?.id ?? null)
      : null;
    return {
      id: p.id,
      nome: p.selecao.nome || '(sem nome)',
      especie: p.selecao.especie ?? '—',
      classe: p.selecao.classe ?? '—',
      classeId,
      iconeId: subclasseId ?? classeId,
      nivel: p.nivel,
      pvAtual: p.pvAtual,
      // `p.pvMax` é o PV máximo real (acumulado nos Level Ups) — cai
      // pro cálculo de nível 1 só em personagens salvos antes desse
      // campo existir (mesmo padrão de fallback do FichaShell.tsx).
      // Sem isso, todo personagem acima do nível 1 mostrava um "PV
      // máximo" de nível 1 aqui, menor que o PV atual de verdade.
      pvMax: p.pvMax ?? calcularPvMaximoNivel1(p.selecao) ?? p.pvAtual,
    };
  });

  function abrirConfirmacao(id: string, nome: string, e: React.MouseEvent) {
    e.stopPropagation();
    setAlvoApagar({ id, nome });
    setTextoDigitado('');
  }

  function fecharConfirmacao() {
    setAlvoApagar(null);
    setTextoDigitado('');
  }

  function confirmarApagar() {
    if (!alvoApagar) return;
    armazenamentoPersonagens.apagar(alvoApagar.id);
    fecharConfirmacao();
    setVersao((v) => v + 1);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.header}>
        <span className="back" onClick={() => navigate('/home')}>
          ←
        </span>
        <div>
          <div className={styles.headerTitle}>Seus personagens</div>
          <div className="label">atrelados à sua conta Google</div>
        </div>
      </div>

      <div className="btn" style={{ marginBottom: 10 }} onClick={() => setModalTesteAberto(true)}>
        🎲 Personagem de Teste — gera uma ficha completa na hora, pra testar rápido
      </div>

      {personagens.length === 0 && (
        <div className="box" style={{ padding: 16, textAlign: 'center' }} onClick={() => navigate('/wizard')}>
          <div style={{ marginBottom: 6 }}>Você ainda não tem nenhum personagem.</div>
          <div className="btn btn-primary" style={{ display: 'inline-block' }}>
            ＋ Criar personagem
          </div>
        </div>
      )}

      {personagens.map((c) => (
        <div key={c.id} className={`box ${styles.card}`} onClick={() => navigate(`/ficha/${c.id}`)}>
          <div className={styles.avatar}>{c.iconeId ? <IconeClasse id={c.iconeId} /> : '👤'}</div>
          <div className={styles.info}>
            <div className={styles.name}>{c.nome}</div>
            <div className={styles.meta}>
              {c.especie} · {c.classe} · Nível {c.nivel}
            </div>
          </div>
          <span className="tag">
            {c.pvAtual}/{c.pvMax} PV
          </span>
          <div className={styles.deleteBtn} onClick={(e) => abrirConfirmacao(c.id, c.nome, e)}>
            🗑️
          </div>
        </div>
      ))}

      {alvoApagar && (
        <div className={styles.overlay} onClick={(e) => { e.stopPropagation(); fecharConfirmacao(); }}>
          <div className={styles.confirmCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmTitle}>Apagar {alvoApagar.nome}?</div>
            <div className={styles.confirmDesc}>
              Isso apaga o personagem de vez, sem como desfazer. Digite <b>{PALAVRA_CONFIRMACAO}</b> pra
              confirmar.
            </div>
            <input
              className={`box ${styles.confirmInput}`}
              autoFocus
              value={textoDigitado}
              onChange={(e) => setTextoDigitado(e.target.value)}
              placeholder={PALAVRA_CONFIRMACAO}
            />
            <div className={styles.confirmActions}>
              <div className="btn" style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); fecharConfirmacao(); }}>
                Cancelar
              </div>
              <div
                className={`btn ${styles.confirmBtnApagar} ${textoDigitado.trim().toLowerCase() !== PALAVRA_CONFIRMACAO ? 'btn-disabled' : ''}`}
                style={{ flex: 1 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (textoDigitado.trim().toLowerCase() === PALAVRA_CONFIRMACAO) confirmarApagar();
                }}
              >
                Apagar
              </div>
            </div>
          </div>
        </div>
      )}

      {modalTesteAberto && (
        <PersonagemTesteModal
          onFechar={() => setModalTesteAberto(false)}
          onCriado={(id) => navigate(`/ficha/${id}`)}
        />
      )}
    </div>
  );
}
