import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeError } from '../api';
import { Aviso } from '../components/common/Estado';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const u = await login(f.correo, f.password);
      nav(u.rol === 'emprendedor' ? '/panel' : u.rol === 'administrador' ? '/admin' : '/');
    } catch (err) { setError(mensajeError(err)); }
  };

  return (
    <form className="panel form" style={{ maxWidth: 420, margin: '3rem auto' }} onSubmit={enviar}>
      <h1>Iniciar sesión</h1>
      <label>Correo<input type="email" required autoComplete="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} /></label>
      <label>Contraseña<input type="password" required autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <Aviso>{error}</Aviso>
      <button className="btn">Entrar</button>
      <p>¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
    </form>
  );
}
