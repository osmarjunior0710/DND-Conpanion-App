import { useNavigate } from 'react-router-dom';
import { exampleCharacters } from '../../data/exampleCharacters';
import { armazenamentoPersonagens } from '../../core/armazenamentoPersonagens';
import { calcularPvMaximoNivel1 } from '../../core/calculoPersonagem';
import styles from './CharacterList.module.css';

export default function CharacterList() {
  const navigate = useNavigate();

  const personagensReais = armazenamentoPersonagens.listar().map((p) => ({
    id: p.id,
    nome: p.selecao.nome || '(sem nome)',
    especie: p.selecao.especie ?? '—',
    classe: p.selecao.classe ?? '—',
    nivel: p.nivel,
    pvAtual: p.pvAtual,
    pvMax: calcularPvMaximoNivel1(p.selecao) ?? p.pvAtual,
    faded: false,
  }));

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

      {personagensReais.length > 0 && (
        <div className="label" style={{ marginBottom: 6 }}>
          criados pelo wizard — a Ficha ainda mostra dado de exemplo ao abrir (entrega seguinte liga isso)
        </div>
      )}
      {personagensReais.map((c) => (
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
        </div>
      ))}

      {exampleCharacters.map((c) => (
        <div
          key={c.id}
          className={`box ${styles.card} ${c.faded ? styles.cardFaded : ''}`}
          onClick={() => navigate(`/ficha/${c.id}`)}
        >
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
        </div>
      ))}
    </div>
  );
}
