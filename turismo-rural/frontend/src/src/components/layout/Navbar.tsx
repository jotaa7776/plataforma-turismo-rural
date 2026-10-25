import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const nav = useNavigate();
  return (
    <header className="navbar">
      <div className="contenedor navbar-fila">
        <Link to="/" className="marca">Territorio Vivo</Link>
        <nav aria-label="Principal">
          <NavLink to="/catalogo">Experiencias</NavLink>
          {usuario?.rol === 'visitante' && <NavLink to="/mis-reservas">Mis reservas</NavLink>}
          {usuario?.rol === 'emprendedor' && <NavLink to="/panel">Mi emprendimiento</NavLink>}
          {usuario?.rol === 'administrador' && <NavLink to="/admin">Administración</NavLink>}
          {usuario ? (
            <button className="enlace" onClick={() => { logout(); nav('/'); }}>Cerrar sesión ({usuario.nombre})</button>
          ) : (
            <>
              <NavLink to="/login">Iniciar sesión</NavLink>
              <NavLink to="/registro" className="btn chico">Crear cuenta</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
