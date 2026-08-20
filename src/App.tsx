import { Navigate, Route, Routes } from 'react-router-dom';
import Splash from './ui/screens/Splash';
import Login from './ui/screens/Login';
import Home from './ui/screens/Home';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
