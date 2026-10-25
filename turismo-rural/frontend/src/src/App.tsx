import { Route, Routes } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import DetalleExperiencia from './pages/DetalleExperiencia';
import DetalleLocalidad from './pages/DetalleLocalidad';
import PerfilEmprendimiento from './pages/PerfilEmprendimiento';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MisReservas from './pages/MisReservas';
import Pago from './pages/Pago';
import PanelEmprendedor from './pages/PanelEmprendedor';
import PanelAdmin from './pages/PanelAdmin';

export default function App() {
  return (
    <>
      <a className="saltar" href="#contenido">Saltar al contenido</a>
      <Navbar />
      <main id="contenido" className="contenedor">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/experiencias/:id" element={<DetalleExperiencia />} />
          <Route path="/localidades/:id" element={<DetalleLocalidad />} />
          <Route path="/emprendimientos/:id" element={<PerfilEmprendimiento />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/mis-reservas" element={<ProtectedRoute roles={['visitante']}><MisReservas /></ProtectedRoute>} />
          <Route path="/pago/:id" element={<ProtectedRoute roles={['visitante']}><Pago /></ProtectedRoute>} />
          <Route path="/panel" element={<ProtectedRoute roles={['emprendedor']}><PanelEmprendedor /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute roles={['administrador']}><PanelAdmin /></ProtectedRoute>} />
          <Route path="*" element={<p>No encontramos esta página. <a href="/">Volver al inicio</a></p>} />
        </Routes>
      </main>
      <footer className="pie">Plataforma de Turismo Rural y Comunitario · Reservas directas con cada emprendimiento</footer>
    </>
  );
}
