import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <div className={styles.topbar}>
        <div className="label">logado como</div>
        <div className={styles.avatar} onClick={() => navigate('/login')}>
          👤
        </div>
      </div>
      <div className={styles.title}>Seu grupo, suas fichas</div>
      <div className={styles.sub}>tela inicial — 3 opções fixas</div>

      <div className={`btn ${styles.opt}`} onClick={() => navigate('/wizard')}>
        <div className={styles.optTitle}>＋ Criar personagem</div>
        <div className={styles.optDesc}>wizard de criação em 10 passos</div>
      </div>

      <div className={`btn ${styles.opt}`} onClick={() => navigate('/lista')}>
        <div className={styles.optTitle}>📂 Lista de personagens</div>
        <div className={styles.optDesc}>fichas salvas na sua conta</div>
      </div>

      <div className={`btn btn-disabled ${styles.opt}`}>
        <div className={styles.optTitle}>🛠 Ferramentas de GM</div>
        <div className={styles.optDesc}>em breve</div>
      </div>
    </div>
  );
}
