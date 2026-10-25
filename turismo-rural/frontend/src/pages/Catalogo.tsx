import { Link, useSearchParams } from 'react-router-dom';
import { dinero, duracion } from '../api';
import { Datos, Vacio } from '../components/common/Estado';
import SelectorLocalidad from '../components/common/SelectorLocalidad';
import TarjetaExperiencia from '../components/common/TarjetaExperiencia';
import { useFetch } from '../hooks/useFetch';
import { Experiencia, Ruta } from '../types';

export default function Catalogo() {
  const [sp, setSp] = useSearchParams();
  const region = sp.get('region') || '';
  const comuna = sp.get('comuna') || '';
  const tipo = sp.get('tipo') || '';
  const vista = sp.get('vista') === 'rutas' ? 'rutas' : 'experiencias';

  const cambiar = (cambios: Record<string, string>) => {
    const n = new URLSearchParams(sp);
    Object.entries(cambios).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    setSp(n);
  };
  const zona = { region: region || undefined, comuna: comuna || undefined };
  const exp = useFetch<Experiencia[]>(vista === 'experiencias' ? '/experiencias' : null, { ...zona, tipo: tipo || undefined });
  const rutas = useFetch<Ruta[]>(vista === 'rutas' ? '/rutas' : null, zona);
  const lugar = comuna || region || 'esta zona';

  return (
    <>
      <h1 style={{ marginTop: '2rem' }}>Qué hacer en el territorio</h1>
      <div className="tabs" role="tablist">
        <button role="tab" aria-selected={vista === 'experiencias'} onClick={() => cambiar({ vista: '' })}>Experiencias y servicios</button>
        <button role="tab" aria-selected={vista === 'rutas'} onClick={() => cambiar({ vista: 'rutas' })}>Rutas</button>
      </div>
      <div className="fila" style={{ marginBottom: '1.2rem', alignItems: 'end' }}>
        <SelectorLocalidad region={region} comuna={comuna} onChange={(r, c) => cambiar({ region: r, comuna: c })} />
        {vista === 'experiencias' && (
          <label>Tipo
            <select value={tipo} onChange={(e) => cambiar({ tipo: e.target.value })}>
              <option value="">Todos</option>
              <option value="actividad">Actividades</option>
              <option value="servicio">Servicios</option>
              <option value="excursion">Excursiones</option>
            </select>
          </label>
        )}
      </div>

      {vista === 'experiencias' ? (
        <Datos cargando={exp.cargando} error={exp.error}>
          {exp.data?.length ? <div className="grilla">{exp.data.map((e) => <TarjetaExperiencia key={e.id} e={e} />)}</div>
            : <Vacio>No hay servicios disponibles en {lugar} por ahora. Prueba con otra comuna o tipo.</Vacio>}
        </Datos>
      ) : (
        <Datos cargando={rutas.cargando} error={rutas.error}>
          {rutas.data?.length ? (
            <ul className="lista">
              {rutas.data.map((r) => (
                <li key={r.id}>
                  <h3>{r.nombre}</h3>
                  <p>{r.descripcion}</p>
                  <ul className="datos">
                    <li><span>Dificultad</span>{r.dificultad}</li>
                    <li><span>Distancia</span>{r.distanciaKm} km</li>
                    <li><span>Duración</span>{duracion(r.duracionMin)}</li>
                    <li><span>Precio</span>{dinero(r.precio)}</li>
                  </ul>
                  <Link to={`/emprendimientos/${r.emprendimientoId}`}>Ofrecida por {r.emprendimiento?.nombre}</Link>
                </li>
              ))}
            </ul>
          ) : <Vacio>No hay rutas publicadas en {lugar}.</Vacio>}
        </Datos>
      )}
    </>
  );
}
