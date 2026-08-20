import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  message: string;
  backTo: string;
}

export default function Placeholder({ message, backTo }: PlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14 }}>{message}</div>
        <div className="label" style={{ marginTop: 12, cursor: 'pointer' }} onClick={() => navigate(backTo)}>
          ← voltar
        </div>
      </div>
    </div>
  );
}
