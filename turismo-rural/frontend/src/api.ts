import axios from 'axios';

export const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

export function mensajeError(e: any): string {
  const m = e?.response?.data?.message;
  if (Array.isArray(m)) return m.join('. ');
  return m || 'No pudimos completar la acción. Revisa tu conexión e inténtalo otra vez.';
}
export const dinero = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
export const duracion = (min: number) => (min >= 60 ? `${Math.floor(min / 60)} h ${min % 60 ? (min % 60) + ' min' : ''}` : `${min} min`);
