import { useNavigate } from 'react-router-dom';
import { exampleCharacters } from '../../data/exampleCharacters';
import styles from './CharacterList.module.css';

export default function CharacterList() {
  const navigate = useNavigate();

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
