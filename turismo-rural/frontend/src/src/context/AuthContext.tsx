import { createContext, ReactNode, useContext, useState } from 'react';
import { api } from '../api';
import { Rol, Usuario } from '../types';

interface Ctx {
  usuario: Usuario | null;
  login: (correo: string, password: string) => Promise<Usuario>;
  registro: (d: { nombre: string; correo: string; password: string; rol: Rol }) => Promise<Usuario>;
  logout: () => void;
}
const AuthCtx = createContext<Ctx>(null as any);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try { return JSON.parse(localStorage.getItem('usuario') || 'null'); } catch { return null; }
  });

  const guardar = (r: { token: string; usuario: Usuario }) => {
    localStorage.setItem('token', r.token);
    localStorage.setItem('usuario', JSON.stringify(r.usuario));
    setUsuario(r.usuario);
    return r.usuario;
  };
  const login = async (correo: string, password: string) => guardar((await api.post('/auth/login', { correo, password })).data);
  const registro = async (d: any) => guardar((await api.post('/auth/registro', d)).data);
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
  };

  return <AuthCtx.Provider value={{ usuario, login, registro, logout }}>{children}</AuthCtx.Provider>;
}
