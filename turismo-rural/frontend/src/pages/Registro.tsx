import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mensajeError } from '../api';
import { Aviso } from '../components/common/Estado';
import { useAuth } from '../context/AuthContext';
import { Rol } from '../types';

export default function Registro() {
  const { registro } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState<{ nombre: string; correo: string; password: string; rol: Rol }>({ nombre: '', correo: '', password: '', rol: 'visitante' });
  const [error, setError] = useState('');

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const u = await registro(f);
      nav(u.rol === 'emprendedor' ? '/panel' : '/');
    } catch (err) { setError(mensajeError(err)); }
  };

  return (
    <form className="panel form" style={{ maxWidth: 420, margin: '3rem auto' }} onSubmit={enviar}>
      <h1>Crear cuenta</h1>
      <label>Nombre<input required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></label>
      <label>Correo<input type="email" required autoComplete="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} /></label>
      <label>Contraseña (mínimo 6 caracteres)<input type="password" required minLength={6} autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
      <label>Quiero usar la plataforma como
        <select value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value as Rol })}>
          <option value="visitante">Visitante: busco experiencias</option>
          <option value="emprendedor">Emprendedor: ofrezco servicios</option>
        </select>
      </label>
      <Aviso>{error}</Aviso>
      <button className="btn">Crear cuenta</button>
      <p>¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </form>
  );
}
