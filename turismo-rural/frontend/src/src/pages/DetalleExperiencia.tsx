import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, dinero, duracion, mensajeError } from '../api';
import { Aviso, Datos } from '../components/common/Estado';
import Galeria from '../components/common/Galeria';
import { useAuth } from '../context/AuthContext';
import { useFetch } from '../hooks/useFetch';
import { Experiencia } from '../types';

const hoy = () => new Date().toISOString().slice(0, 10);
const diaSiguiente = (s: string) => {
  const d = new Date(`${s}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};
const nochesEntre = (a: string, b: string) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

export default function DetalleExperiencia() {
  const { id } = useParams();
  const nav = useNavigate();
  const { usuario } = useAuth();
  const { data: e, cargando, error } = useFetch<Experiencia>(`/experiencias/${id}`);
  const [f, setF] = useState({ fecha: '', hora: '', fechaSalida: '', cantidadPersonas: 1 });
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const [reservaId, setReservaId] = useState<string | null>(null);

  const esAloj = e?.tipo === 'alojamiento';
  const noches = esAloj && f.fecha && f.fechaSalida ? nochesEntre(f.fecha, f.fechaSalida) : 0;
  const listo = esAloj ? noches >= 1 : !!(f.fecha && f.hora);
  const disp = useFetch<{ disponible: boolean; cupoRestante: number }>(
    listo ? '/reservas/disponibilidad' : null,
    { experienciaId: id, fecha: f.fecha, ...(esAloj ? { fechaSalida: f.fechaSalida } : { hora: f.hora }), cantidad: f.cantidadPersonas },
  );

  const reservar = async (ev: FormEvent) => {
    ev.preventDefault();
    if (!usuario) return nav('/login');
    if (usuario.rol !== 'visitante') return setMsg({ tipo: 'error', texto: 'Solo las cuentas de visitante pueden reservar.' });
    try {
      const res = await api.post('/reservas', {
        experienciaId: id, fecha: f.fecha, cantidadPersonas: f.cantidadPersonas,
        ...(esAloj ? { fechaSalida: f.fechaSalida } : { hora: f.hora }),
      });
      setReservaId(res.data.id);
      setMsg({ tipo: 'ok', texto: 'Reserva creada. Para asegurar tu lugar, continúa con el pago.' });
    } catch (err) {
      setMsg({ tipo: 'error', texto: mensajeError(err) });
    }
  };

  return (
    <Datos cargando={cargando} error={error}>
      {e && (
        <>
          <p style={{ marginTop: '1.5rem' }}>
            <Link to={`/emprendimientos/${e.emprendimientoId}`}>{e.emprendimiento?.nombre}</Link> ·{' '}
            <Link to={`/localidades/${e.emprendimiento?.localidad?.id}`}>{e.emprendimiento?.localidad?.nombre}</Link>
          </p>
          <h1>{e.nombre}</h1>
          <Galeria imagenes={e.imagenes} alt={e.nombre} />
          <div className="dos-col">
            <section>
              <p>{e.descripcion}</p>
              <ul className="datos">
                <li><span>{esAloj ? 'Precio por persona por noche' : 'Precio por persona'}</span>{dinero(e.precio)}</li>
                <li><span>{esAloj ? 'Personas que caben por noche' : 'Cupo por horario'}</span>{e.capacidad} personas</li>
                {e.horarios && <li><span>{esAloj ? 'Horarios de llegada' : 'Horarios'}</span>{e.horarios}</li>}
              </ul>
              {e.ruta && (
                <div className="panel">
                  <h3>Recorrido: {e.ruta.nombre}</h3>
                  <ul className="datos">
                    <li><span>Dificultad</span>{e.ruta.dificultad}</li>
                    <li><span>Distancia</span>{e.ruta.distanciaKm} km</li>
                    <li><span>Duración</span>{duracion(e.ruta.duracionMin)}</li>
                  </ul>
                  <p>{e.ruta.recorrido}</p>
                </div>
              )}
            </section>
            <form className="panel form" onSubmit={reservar}>
              <h2 style={{ marginTop: 0 }}>Reservar</h2>
              {esAloj ? (
                <>
                  <label>Entrada<input type="date" required value={f.fecha} min={hoy()} onChange={(x) => setF({ ...f, fecha: x.target.value, fechaSalida: '' })} /></label>
                  <label>Salida<input type="date" required value={f.fechaSalida} min={f.fecha ? diaSiguiente(f.fecha) : hoy()} disabled={!f.fecha} onChange={(x) => setF({ ...f, fechaSalida: x.target.value })} /></label>
                </>
              ) : (
                <>
                  <label>Fecha<input type="date" required value={f.fecha} min={hoy()} onChange={(x) => setF({ ...f, fecha: x.target.value })} /></label>
                  <label>Hora<input type="time" required value={f.hora} onChange={(x) => setF({ ...f, hora: x.target.value })} /></label>
                </>
              )}
              <label>Personas<input type="number" min={1} required value={f.cantidadPersonas} onChange={(x) => setF({ ...f, cantidadPersonas: Math.max(1, +x.target.value) })} /></label>
              {esAloj && noches >= 1 && <p className="suave" style={{ margin: 0 }}>{noches} {noches === 1 ? 'noche' : 'noches'}</p>}
              {disp.data && (
                <Aviso tipo={disp.data.disponible ? 'ok' : 'error'}>
                  {disp.data.disponible
                    ? `Hay cupo (${disp.data.cupoRestante} lugares libres${esAloj ? ' en todas las noches' : ''}).`
                    : `Sin cupo suficiente: quedan ${disp.data.cupoRestante}.`}
                </Aviso>
              )}
              <Aviso>{disp.error}</Aviso>
              <strong>Total: {dinero(e.precio * f.cantidadPersonas * (esAloj ? Math.max(noches, 1) : 1))}</strong>
              <button className="btn" disabled={!!reservaId || (esAloj && noches < 1) || (disp.data ? !disp.data.disponible : false)}>
                {usuario ? 'Enviar reserva' : 'Inicia sesión para reservar'}
              </button>
              {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
              {reservaId && <Link className="btn" to={`/pago/${reservaId}`}>Pasar a pagar</Link>}
            </form>
          </div>
        </>
      )}
    </Datos>
  );
}
