import { FormEvent, useState } from 'react';
import { api, mensajeError } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { Localidad } from '../../types';
import { Aviso } from '../common/Estado';
import SelectorLocalidad from '../common/SelectorLocalidad';

function useEnvio() {
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);
  const enviar = async (fn: () => Promise<unknown>, ok: string, despues: () => void) => {
    try { await fn(); setMsg({ tipo: 'ok', texto: ok }); despues(); } catch (e) { setMsg({ tipo: 'error', texto: mensajeError(e) }); }
  };
  return { msg, enviar };
}

export default function TerritorioForm() {
  const localidades = useFetch<Localidad[]>('/localidades');
  const [sel, setSel] = useState('');
  const nueva = useEnvio(); const cultura = useEnvio(); const actividad = useEnvio(); const sector = useEnvio();
  const [l, setL] = useState({ region: '', comuna: '', descripcion: '' });
  const [c, setC] = useState({ titulo: '', tipo: 'tradicion', contenido: '' });
  const [a, setA] = useState({ nombre: '', descripcion: '' });
  const [s, setS] = useState({ nombre: '', descripcion: '' });

  const crearLocalidad = (e: FormEvent) => {
    e.preventDefault();
    nueva.enviar(() => api.post('/localidades', { ...l, descripcion: l.descripcion || undefined }), 'Localidad registrada.', () => { setL({ region: '', comuna: '', descripcion: '' }); localidades.recargar(); });
  };

  return (
    <>
      <form className="panel form" onSubmit={crearLocalidad}>
        <h2 style={{ marginTop: 0 }}>Registrar una localidad</h2>
        <SelectorLocalidad requerido region={l.region} comuna={l.comuna} onChange={(region, comuna) => setL({ ...l, region, comuna })} />
        <label>Descripción<textarea value={l.descripcion} onChange={(e) => setL({ ...l, descripcion: e.target.value })} /></label>
        {nueva.msg && <Aviso tipo={nueva.msg.tipo}>{nueva.msg.texto}</Aviso>}
        <button className="btn">Registrar localidad</button>
      </form>

      <div className="panel">
        <label>Completar información de la localidad
          <select value={sel} onChange={(e) => setSel(e.target.value)}>
            <option value="">Selecciona una localidad…</option>
            {localidades.data?.map((x) => <option key={x.id} value={x.id}>{x.nombre} ({x.region})</option>)}
          </select>
        </label>
      </div>

      {sel && (
        <>
          <form className="panel form" onSubmit={(e) => { e.preventDefault(); cultura.enviar(() => api.post(`/localidades/${sel}/cultura`, c), 'Información cultural publicada.', () => setC({ titulo: '', tipo: 'tradicion', contenido: '' })); }}>
            <h3>Tradiciones, costumbres e historia</h3>
            <div className="fila">
              <label>Título<input required value={c.titulo} onChange={(e) => setC({ ...c, titulo: e.target.value })} /></label>
              <label>Tipo
                <select value={c.tipo} onChange={(e) => setC({ ...c, tipo: e.target.value })}>
                  <option value="tradicion">Tradición</option><option value="costumbre">Costumbre</option><option value="historia">Historia</option>
                </select>
              </label>
            </div>
            <label>Contenido<textarea required value={c.contenido} onChange={(e) => setC({ ...c, contenido: e.target.value })} /></label>
            {cultura.msg && <Aviso tipo={cultura.msg.tipo}>{cultura.msg.texto}</Aviso>}
            <button className="btn">Publicar</button>
          </form>

          <form className="panel form" onSubmit={(e) => { e.preventDefault(); actividad.enviar(() => api.post(`/localidades/${sel}/actividades`, a), 'Actividad tradicional registrada.', () => setA({ nombre: '', descripcion: '' })); }}>
            <h3>Actividad tradicional</h3>
            <label>Nombre<input required value={a.nombre} onChange={(e) => setA({ ...a, nombre: e.target.value })} /></label>
            <label>Descripción<textarea required value={a.descripcion} onChange={(e) => setA({ ...a, descripcion: e.target.value })} /></label>
            {actividad.msg && <Aviso tipo={actividad.msg.tipo}>{actividad.msg.texto}</Aviso>}
            <button className="btn">Registrar actividad</button>
          </form>

          <form className="panel form" onSubmit={(e) => { e.preventDefault(); sector.enviar(() => api.post(`/localidades/${sel}/sectores`, { ...s, descripcion: s.descripcion || undefined }), 'Sector creado.', () => setS({ nombre: '', descripcion: '' })); }}>
            <h3>Sector turístico</h3>
            <label>Nombre<input required value={s.nombre} onChange={(e) => setS({ ...s, nombre: e.target.value })} /></label>
            <label>Descripción (opcional)<input value={s.descripcion} onChange={(e) => setS({ ...s, descripcion: e.target.value })} /></label>
            {sector.msg && <Aviso tipo={sector.msg.tipo}>{sector.msg.texto}</Aviso>}
            <button className="btn">Crear sector</button>
          </form>
        </>
      )}
    </>
  );
}
