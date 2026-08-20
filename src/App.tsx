import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './ui/screens/Splash';
import Login from './ui/screens/Login';
import Home from './ui/screens/Home';
import CharacterList from './ui/screens/CharacterList';
import Placeholder from './ui/screens/Placeholder';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/lista" element={<CharacterList />} />
      <Route
        path="/wizard"
        element={<Placeholder message="Wizard de criação chega na entrega 0.3" backTo="/home" />}
      />
      <Route
        path="/ficha/:id"
        element={<Placeholder message="Ficha completa chega na entrega 0.5" backTo="/lista" />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
