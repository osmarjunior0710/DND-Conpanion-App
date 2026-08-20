import { useNavigate } from 'react-router-dom';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className={styles.screen}>
      <div className={styles.title}>Entrar pra continuar</div>
      <div className={styles.sub}>
        Login com Google — restringe o acesso ao seu grupo
        <br />e sincroniza suas fichas entre dispositivos.
      </div>
      <button type="button" className={styles.googleBtn} onClick={() => navigate('/home')}>
        <span className={styles.googleG} /> Continuar com Google
      </button>
      <div className={styles.note}>(fluxo real de OAuth entra na Fase 5 — aqui é só o botão)</div>
    </div>
  );
}
