import { FormEvent, useState } from 'react';
import { api, mensajeError } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { Emprendimiento, Localidad } from '../../types';
import { Aviso } from '../common/Estado';
import SelectorLocalidad from '../common/SelectorLocalidad';

export default function EmprendimientoForm({ emp, onGuardado }: { emp?: Emprendimiento; onGuardado: () => void }) {
  const [f, setF] = useState({
    nombre: emp?.nombre ?? '', descripcion: emp?.descripcion ?? '', contacto: emp?.contacto ?? '',
    region: emp?.localidad?.region ?? '', comuna: emp?.localidad?.nombre ?? '', sectorId: emp?.sectorId ?? '',
  });
  const [fotos, setFotos] = useState<File[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null);

  // Si la comuna ya está registrada como localidad, se cargan sus sectores turísticos.
  const existentes = useFetch<Localidad[]>(f.region && f.comuna ? '/localidades' : null, { region: f.region, comuna: f.comuna });
  const idLocalidad = existentes.data?.[0]?.id;
  const detalle = useFetch<Localidad>(idLocalidad ? `/localidades/${idLocalidad}` : null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });

  const guardar = async (e: FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMsg(null);
    try {
      const loc = await api.post('/localidades', { region: f.region, comuna: f.comuna }); // crea la localidad si no existe
      const body = { nombre: f.nombre, descripcion: f.descripcion, contacto: f.contacto, localidadId: loc.data.id, sectorId: f.sectorId || undefined };
      const res = emp ? await api.patch(`/emprendimientos/${emp.id}`, body) : await api.post('/emprendimientos', body);

      let fallidas = 0;
      for (const archivo of fotos) {
        const fd = new FormData();
        fd.append('archivo', archivo);
        fd.append('emprendimientoId', res.data.id);
        try { await api.post('/imagenes', fd); } catch { fallidas++; }
      }
      setFotos([]);
      setMsg({
        tipo: fallidas ? 'error' : 'ok',
        texto: (emp ? 'Cambios guardados.' : 'Emprendimiento enviado. Un administrador lo revisará antes de publicarlo.')
          + (fallidas ? ` ${fallidas} foto(s) no se pudieron subir; agrégalas abajo.` : ''),
      });
      onGuardado();
    } catch (err) { setMsg({ tipo: 'error', texto: mensajeError(err) }); }
    setGuardando(false);
  };

  return (
    <form className="panel form" onSubmit={guardar}>
      <h2 style={{ marginTop: 0 }}>{emp ? 'Datos del emprendimiento' : 'Registra tu emprendimiento'}</h2>
      <label>Nombre<input required value={f.nombre} onChange={set('nombre')} /></label>
      <label>Descripción<textarea required value={f.descripcion} onChange={set('descripcion')} /></label>
      <label>Contacto (teléfono, WhatsApp o correo)<input required value={f.contacto} onChange={set('contacto')} /></label>

      <SelectorLocalidad requerido region={f.region} comuna={f.comuna}
        onChange={(region, comuna) => setF({ ...f, region, comuna, sectorId: '' })} />
      <label>Sector turístico (opcional)
        <select value={f.sectorId} onChange={set('sectorId')} disabled={!detalle.data?.sectores?.length}>
          <option value="">{detalle.data?.sectores?.length ? 'Sin sector' : 'Esta comuna aún no tiene sectores'}</option>
          {detalle.data?.sectores?.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
      </label>

      {!emp && (
        <label>Fotos del emprendimiento (opcional; JPG, PNG o WebP)
          <input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => setFotos(Array.from(e.target.files ?? []))} />
          {fotos.length > 0 && <small>{fotos.length} foto(s) seleccionada(s)</small>}
        </label>
      )}

      {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
      <button className="btn" disabled={guardando}>
        {guardando ? 'Guardando…' : emp ? 'Guardar cambios' : 'Enviar para revisión'}
      </button>
    </form>
  );
}
