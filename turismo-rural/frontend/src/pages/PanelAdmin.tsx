import { useState } from 'react';
import { api, dinero, mensajeError } from '../api';
import { Aviso, Datos, EstadoTag, PagoTag, Vacio } from '../components/common/Estado';
import { useFetch } from '../hooks/useFetch';
import { Emprendimiento, Reserva } from '../types';

interface Indicadores {
  usuarios: number; experiencias: number; rutas: number; imagenes: number; almacenamientoImagenesMB: number;
  emprendimientos: Record<string, number>; reservas: Record<string, number>;
}

function Emprendimientos() {
  const [estado, setEstado] = useState('pendiente');
  const { data, cargando, error, recargar } = useFetch<Emprendimiento[]>('/admin/emprendimientos', { estado: estado || undefined });
  const [msg, setMsg] = useState('');
  const cambiar = async (id: string, que: 'aprobar' | 'rechazar') => {
    setMsg('');
    try { await api.patch(`/admin/emprendimientos/${id}/${que}`); recargar(); } catch (e) { setMsg(mensajeError(e)); }
  };
  return (
    <>
      <label style={{ maxWidth: 220, marginBottom: '1rem' }}>Estado
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="pendiente">Pendientes</option><option value="aprobado">Aprobados</option>
          <option value="rechazado">Rechazados</option><option value="">Todos</option>
        </select>
      </label>
      <Aviso>{msg}</Aviso>
      <Datos cargando={cargando} error={error}>
        {data?.length ? (
          <ul className="lista">
            {data.map((e) => (
              <li key={e.id}>
                <div className="acciones"><strong>{e.nombre}</strong><EstadoTag estado={e.estado} /></div>
                <p style={{ margin: 0 }}>{e.descripcion}</p>
                <p className="suave" style={{ margin: 0 }}>{e.localidad?.nombre} · {e.contacto} · Propietario: {e.propietario?.nombre} ({e.propietario?.correo})</p>
                <div className="acciones">
                  {e.estado !== 'aprobado' && <button className="btn" onClick={() => cambiar(e.id, 'aprobar')}>Aprobar</button>}
                  {e.estado !== 'rechazado' && <button className="btn peligro" onClick={() => cambiar(e.id, 'rechazar')}>Rechazar</button>}
                </div>
              </li>
            ))}
          </ul>
        ) : <Vacio>No hay emprendimientos con este estado.</Vacio>}
      </Datos>
    </>
  );
}

function Reservas() {
  const [estado, setEstado] = useState('');
  const { data, cargando, error } = useFetch<Reserva[]>('/admin/reservas', { estado: estado || undefined });
  return (
    <>
      <label style={{ maxWidth: 220, marginBottom: '1rem' }}>Estado
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todas</option><option value="pendiente">Pendientes</option><option value="aceptada">Aceptadas</option>
          <option value="rechazada">Rechazadas</option><option value="cancelada">Canceladas</option>
        </select>
      </label>
      <Datos cargando={cargando} error={error}>
        {data?.length ? (
          <ul className="lista">
            {data.map((r) => (
              <li key={r.id}>
                <div className="acciones"><strong>{r.experiencia?.nombre}</strong><EstadoTag estado={r.estado} /><PagoTag pago={r.pago} /></div>
                <p style={{ margin: 0 }}>{r.fecha} {r.hora} · {r.cantidadPersonas} persona(s) · {dinero(r.total)}</p>
                <p className="suave" style={{ margin: 0 }}>{r.experiencia?.emprendimiento?.nombre} · Visitante: {r.visitante?.nombre}</p>
              </li>
            ))}
          </ul>
        ) : <Vacio>No hay reservas con este estado.</Vacio>}
      </Datos>
    </>
  );
}

function Resumen() {
  const { data: i, cargando, error } = useFetch<Indicadores>('/admin/indicadores');
  const lista = (o: Record<string, number>) => Object.entries(o).map(([k, v]) => `${v} ${k}`).join(' · ') || 'Sin datos';
  return (
    <Datos cargando={cargando} error={error}>
      {i && (
        <>
          <div className="indicadores">
            <div><strong>{i.usuarios}</strong>usuarios</div>
            <div><strong>{i.experiencias}</strong>experiencias</div>
            <div><strong>{i.rutas}</strong>rutas</div>
            <div><strong>{i.almacenamientoImagenesMB} MB</strong>en {i.imagenes} imágenes</div>
          </div>
          <p style={{ marginTop: '1rem' }}><strong>Emprendimientos:</strong> {lista(i.emprendimientos)}</p>
          <p><strong>Reservas:</strong> {lista(i.reservas)}</p>
        </>
      )}
    </Datos>
  );
}

export default function PanelAdmin() {
  const [tab, setTab] = useState<'emprendimientos' | 'reservas' | 'resumen'>('emprendimientos');
  return (
    <>
      <h1 style={{ marginTop: '2rem' }}>Administración</h1>
      <div className="tabs" role="tablist">
        {([['emprendimientos', 'Emprendimientos'], ['reservas', 'Reservas'], ['resumen', 'Uso de la plataforma']] as const).map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{t}</button>
        ))}
      </div>
      {tab === 'emprendimientos' && <Emprendimientos />}
      {tab === 'reservas' && <Reservas />}
      {tab === 'resumen' && <Resumen />}
    </>
  );
}
