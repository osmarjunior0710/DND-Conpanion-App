import { useState, type ReactNode } from 'react';
import type { Magia } from '../../data/rulesets/dnd2024/magias';
import styles from './GrupoMagiaColapsavel.module.css';

interface GrupoMagiaColapsavelProps {
  label: string;
  magias: Magia[];
  children: (magia: Magia) => ReactNode;
}

export default function GrupoMagiaColapsavel({ label, magias, children }: GrupoMagiaColapsavelProps) {
  const [expandido, setExpandido] = useState(true);

  if (magias.length === 0) return null;

  return (
    <>
      <div className={styles.grupoHeader} onClick={() => setExpandido((v) => !v)}>
        <span>
          {label} ({magias.length})
        </span>
        <span>{expandido ? '▾' : '▸'}</span>
      </div>
      {expandido && magias.map((m) => children(m))}
    </>
  );
}
