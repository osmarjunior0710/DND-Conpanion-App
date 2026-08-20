import { APP_VERSION } from '../../version';
import styles from './VersionBadge.module.css';

export default function VersionBadge() {
  return <div className={styles.badge}>{APP_VERSION}</div>;
}
