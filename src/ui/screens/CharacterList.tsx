import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { armazenamentoPersonagens } from '../../core/armazenamentoPersonagens';
import { calcularPvMaximoNivel1 } from '../../core/calculoPersonagem';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import styles from './CharacterList.module.css';

const PALAVRA_CONFIRMACAO = 'apagar';

export default function CharacterList() {
  const navigate = useNavigate();
  const [, setVersao] = useState(0);
  const [alvoApagar, setAlvoApagar] = useState<{ id: string; nome: string } | null>(null);
  const [textoDigitado, setTextoDigitado] = useState('');
  useLockBodyScroll(alvoApagar !== null);

  const personagens = armazenamentoPersonagens.listar().map((p) => ({
    id: p.id,
    nome: p.selecao.nome || '(sem nome)',
    especie: p.selecao.especie ?? '—',
    classe: p.selecao.classe ?? '—',
    nivel: p.nivel,
    pvAtual: p.pvAtual,
    pvMax: calcularPvMaximoNivel1(p.selecao) ?? p.pvAtual,
  }));

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
          <div className={styles.avatar}>👤</div>
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
    </div>
  );
}
