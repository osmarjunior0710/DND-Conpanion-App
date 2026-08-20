import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';

const SPLASH_DURATION_MS = 1700;

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login', { replace: true }), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.screen}>
      <div className={styles.art}>🐉</div>
      <div className="label">imagem genérica de RPG aqui</div>
      <div className={styles.bar}>
        <div className={styles.barFill} />
      </div>
      <div className={styles.note}>Carregando dados do sistema antes de liberar a navegação.</div>
    </div>
  );
}
