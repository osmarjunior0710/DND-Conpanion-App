import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './ui/screens/Splash';
import Login from './ui/screens/Login';
import Home from './ui/screens/Home';
import CharacterList from './ui/screens/CharacterList';
import Placeholder from './ui/screens/Placeholder';
import VersionBadge from './ui/components/VersionBadge';
import WizardShell from './ui/wizard/WizardShell';

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/lista" element={<CharacterList />} />
        <Route path="/wizard" element={<WizardShell />} />
        <Route
          path="/ficha/:id"
          element={<Placeholder message="Ficha completa chega na entrega 0.5" backTo="/lista" />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <VersionBadge />
    </>
  );
}
