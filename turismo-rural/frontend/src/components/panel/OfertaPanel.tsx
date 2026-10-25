import { FormEvent, useState } from 'react';
import { api, dinero, mensajeError } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { Emprendimiento, Experiencia, Ruta } from '../../types';
import { Aviso, Datos, Vacio } from '../common/Estado';
import GaleriaEditable from './GaleriaEditable';
import SubirImagen from './SubirImagen';

export default function OfertaPanel({ emp }: { emp: Emprendimiento }) {
  const exp = useFetch<Experiencia[]>('/experiencias/mias');
  const rutas = useFetch<Ruta[]>('/rutas/mias');
  const [msg, setMsg] = useState('');
  const [e, setE] = useState({ nombre: '', descripcion: '', tipo: 'actividad', precio: 0, capacidad: 10, horarios: '', rutaId: '' });
  const [r, setR] = useState({ nombre: '', descripcion: '', dificultad: 'facil', distanciaKm: 1, duracionMin: 60, recorrido: '', precio: 0 });
  const [edit, setEdit] = useState<Record<string, { precio: string; horarios: string }>>({});

  const intentar = async (fn: () => Promise<unknown>, despues: () => void) => {
    setMsg('');
    try { await fn(); despues(); } catch (err) { setMsg(mensajeError(err)); }
  };
  const crearExp = (ev: FormEvent) => {
    ev.preventDefault();
    intentar(() => api.post('/experiencias', { ...e, emprendimientoId: emp.id, horarios: e.horarios || undefined, rutaId: e.rutaId || undefined }), () => { setE({ ...e, nombre: '', descripcion: '' }); exp.recargar(); });
  };
  const crearRuta = (ev: FormEvent) => {
    ev.preventDefault();
    intentar(() => api.post('/rutas', { ...r, emprendimientoId: emp.id }), () => { setR({ ...r, nombre: '', descripcion: '', recorrido: '' }); rutas.recargar(); });
  };
  const actualizar = (x: Experiencia) =>
    intentar(() => api.patch(`/experiencias/${x.id}`, { precio: +edit[x.id].precio, horarios: edit[x.id].horarios || undefined }), () => { setEdit({ ...edit, [x.id]: undefined as any }); exp.recargar(); });

  return (
    <>
      <Aviso>{msg}</Aviso>

      <h2 style={{ marginTop: 0 }}>Rutas</h2>
      <form className="panel form" onSubmit={crearRuta}>
        <div className="fila">
          <label>Nombre<input required value={r.nombre} onChange={(x) => setR({ ...r, nombre: x.target.value })} /></label>
          <label>Dificultad
            <select value={r.dificultad} onChange={(x) => setR({ ...r, dificultad: x.target.value })}>
              <option value="facil">Fácil</option><option value="media">Media</option><option value="dificil">Difícil</option>
            </select>
          </label>
        </div>
        <label>Descripción<textarea required value={r.descripcion} onChange={(x) => setR({ ...r, descripcion: x.target.value })} /></label>
        <label>Recorrido (puntos de paso)<textarea required value={r.recorrido} onChange={(x) => setR({ ...r, recorrido: x.target.value })} /></label>
        <div className="fila">
          <label>Distancia (km)<input type="number" min={0} step="0.1" value={r.distanciaKm} onChange={(x) => setR({ ...r, distanciaKm: +x.target.value })} /></label>
          <label>Duración (min)<input type="number" min={1} value={r.duracionMin} onChange={(x) => setR({ ...r, duracionMin: +x.target.value })} /></label>
          <label>Precio (CLP)<input type="number" min={0} value={r.precio} onChange={(x) => setR({ ...r, precio: +x.target.value })} /></label>
        </div>
        <button className="btn">Publicar ruta</button>
      </form>
      <Datos cargando={rutas.cargando} error={rutas.error}>
        {rutas.data?.length ? (
          <ul className="lista">
            {rutas.data.map((x) => (
              <li key={x.id}>
                <strong>{x.nombre}</strong> <span className="suave">{x.dificultad} · {x.distanciaKm} km · {x.duracionMin} min · {dinero(x.precio)}</span>
                <GaleriaEditable imagenes={x.imagenes} onCambio={rutas.recargar} />
                <SubirImagen campo="rutaId" id={x.id} onListo={rutas.recargar} />
              </li>
            ))}
          </ul>
        ) : <Vacio>Aún no has publicado rutas.</Vacio>}
      </Datos>

      <h2>Experiencias y servicios</h2>
      <form className="panel form" onSubmit={crearExp}>
        <div className="fila">
          <label>Nombre<input required value={e.nombre} onChange={(x) => setE({ ...e, nombre: x.target.value })} /></label>
          <label>Tipo
            <select value={e.tipo} onChange={(x) => setE({ ...e, tipo: x.target.value })}>
              <option value="actividad">Actividad</option><option value="servicio">Servicio</option><option value="alojamiento">Alojamiento</option><option value="excursion">Excursión</option>
            </select>
          </label>
        </div>
        <label>Descripción<textarea required value={e.descripcion} onChange={(x) => setE({ ...e, descripcion: x.target.value })} /></label>
        <div className="fila">
          <label>{e.tipo === 'alojamiento' ? 'Precio por persona por noche (CLP)' : 'Precio por persona (CLP)'}<input type="number" min={0} required value={e.precio} onChange={(x) => setE({ ...e, precio: +x.target.value })} /></label>
          <label>{e.tipo === 'alojamiento' ? 'Personas que caben por noche' : 'Cupo por horario'}<input type="number" min={1} required value={e.capacidad} onChange={(x) => setE({ ...e, capacidad: +x.target.value })} /></label>
          <label>Horarios (ej. 09:00, 15:00)<input value={e.horarios} onChange={(x) => setE({ ...e, horarios: x.target.value })} /></label>
        </div>
        <label>Ruta asociada (opcional)
          <select value={e.rutaId} onChange={(x) => setE({ ...e, rutaId: x.target.value })}>
            <option value="">Sin ruta</option>
            {rutas.data?.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
          </select>
        </label>
        <button className="btn">Publicar experiencia</button>
      </form>
      <Datos cargando={exp.cargando} error={exp.error}>
        {exp.data?.length ? (
          <ul className="lista">
            {exp.data.map((x) => {
              const ed = edit[x.id];
              return (
                <li key={x.id}>
                  <strong>{x.nombre}</strong> <span className="suave">{x.tipo} · {dinero(x.precio)} · cupo {x.capacidad}{x.horarios && ` · ${x.horarios}`}</span>
                  {ed ? (
                    <div className="fila">
                      <label>Precio (CLP)<input type="number" min={0} value={ed.precio} onChange={(ev) => setEdit({ ...edit, [x.id]: { ...ed, precio: ev.target.value } })} /></label>
                      <label>Horarios<input value={ed.horarios} onChange={(ev) => setEdit({ ...edit, [x.id]: { ...ed, horarios: ev.target.value } })} /></label>
                      <div className="acciones">
                        <button className="btn" onClick={() => actualizar(x)}>Guardar</button>
                        <button className="btn sec" onClick={() => setEdit({ ...edit, [x.id]: undefined as any })}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div><button className="btn sec" onClick={() => setEdit({ ...edit, [x.id]: { precio: String(x.precio), horarios: x.horarios ?? '' } })}>Actualizar precio y horarios</button></div>
                  )}
                  <GaleriaEditable imagenes={x.imagenes} onCambio={exp.recargar} />
                  <SubirImagen campo="experienciaId" id={x.id} onListo={exp.recargar} />
                </li>
              );
            })}
          </ul>
        ) : <Vacio>Aún no has publicado experiencias.</Vacio>}
      </Datos>
    </>
  );
}
