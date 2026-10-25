import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, dinero, mensajeError } from '../api';
import { Aviso, Datos, EstadoTag, PagoTag, Vacio } from '../components/common/Estado';
import { useFetch } from '../hooks/useFetch';
import { Reserva } from '../types';

export default function MisReservas() {
  const { data, cargando, error, recargar } = useFetch<Reserva[]>('/reservas/mias');
  const [editando, setEditando] = useState<string | null>(null);
  const [f, setF] = useState({ fecha: '', hora: '', cantidadPersonas: 1 });
  const [msg, setMsg] = useState('');

  const accion = async (fn: () => Promise<unknown>) => {
    setMsg('');
    try { await fn(); setEditando(null); recargar(); } catch (e) { setMsg(mensajeError(e)); }
  };

  return (
    <>
      <h1 style={{ marginTop: '2rem' }}>Mis reservas</h1>
      <Aviso>{msg}</Aviso>
      <Datos cargando={cargando} error={error}>
        {data?.length ? (
          <ul className="lista">
            {data.map((r) => (
              <li key={r.id}>
                <div className="acciones">
                  <h3 style={{ margin: 0 }}><Link to={`/experiencias/${r.experiencia?.id}`}>{r.experiencia?.nombre}</Link></h3>
                  <EstadoTag estado={r.estado} /> <PagoTag pago={r.pago} />
                </div>
                <p style={{ margin: 0 }}>{r.fecha} a las {r.hora} · {r.cantidadPersonas} persona(s) · {dinero(r.total)}</p>
                {r.pago?.estado !== 'pagado' && (r.estado === 'pendiente' || r.estado === 'aceptada') && (
                  <div><Link className="btn" to={`/pago/${r.id}`}>Pasar a pagar</Link></div>
                )}
                {editando === r.id ? (
                  <div className="fila">
                    <label>Fecha<input type="date" value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></label>
                    <label>Hora<input type="time" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} /></label>
                    <label>Personas<input type="number" min={1} value={f.cantidadPersonas} onChange={(e) => setF({ ...f, cantidadPersonas: +e.target.value })} /></label>
                    <div className="acciones">
                      <button className="btn" onClick={() => accion(() => api.patch(`/reservas/${r.id}`, f))}>Guardar cambios</button>
                      <button className="btn sec" onClick={() => setEditando(null)}>Cancelar edición</button>
                    </div>
                  </div>
                ) : (r.estado === 'pendiente' || r.estado === 'aceptada') && (
                  <div className="acciones">
                    <button className="btn sec" onClick={() => { setEditando(r.id); setF({ fecha: r.fecha, hora: r.hora, cantidadPersonas: r.cantidadPersonas }); }}>Modificar</button>
                    <button className="btn peligro" onClick={() => window.confirm('¿Cancelar esta reserva?') && accion(() => api.patch(`/reservas/${r.id}/cancelar`))}>Cancelar reserva</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : <Vacio>Aún no tienes reservas. <Link to="/catalogo">Explora las experiencias</Link>.</Vacio>}
      </Datos>
    </>
  );
}
