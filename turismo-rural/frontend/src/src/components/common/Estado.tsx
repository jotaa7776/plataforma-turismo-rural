import { ReactNode } from 'react';

export const Cargando = () => <p className="estado" role="status">Cargando…</p>;
export const Vacio = ({ children }: { children: ReactNode }) => <p className="estado vacio">{children}</p>;
export const Aviso = ({ tipo = 'error', children }: { tipo?: 'error' | 'ok'; children: ReactNode }) =>
  children ? <p className={`aviso ${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>{children}</p> : null;

/** Muestra cargando / error / contenido según el estado de useFetch. */
export function Datos({ cargando, error, children }: { cargando: boolean; error: string; children: ReactNode }) {
  if (cargando) return <Cargando />;
  if (error) return <Aviso>{error}</Aviso>;
  return <>{children}</>;
}

export const PagoTag = ({ pago }: { pago?: { estado: string } | null }) =>
  pago?.estado === 'pagado' ? <span className="tag pagado">Pagado</span>
  : pago?.estado === 'reembolsado' ? <span className="tag pendiente">Reembolsado</span>
  : <span className="tag pendiente">Sin pagar</span>;

export const EstadoTag = ({ estado }: { estado: string }) => <span className={`tag ${estado}`}>{estado}</span>;
