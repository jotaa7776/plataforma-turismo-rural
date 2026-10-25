import { Link, useParams } from 'react-router-dom';
import { Datos, Vacio } from '../components/common/Estado';
import { useFetch } from '../hooks/useFetch';
import { Emprendimiento, Localidad } from '../types';

const TITULOS = { historia: 'Historia', tradicion: 'Tradiciones', costumbre: 'Costumbres' } as const;

export default function DetalleLocalidad() {
  const { id } = useParams();
  const { data: l, cargando, error } = useFetch<Localidad>(`/localidades/${id}`);
  const emp = useFetch<Emprendimiento[]>('/emprendimientos', { localidadId: id });

  return (
    <Datos cargando={cargando} error={error}>
      {l && (
        <>
          <h1 style={{ marginTop: '2rem' }}>{l.nombre}</h1>
          <p className="suave">{l.region}</p>
          {l.descripcion && <p>{l.descripcion}</p>}

          {(['historia', 'tradicion', 'costumbre'] as const).map((t) => {
            const items = l.informacion?.filter((i) => i.tipo === t) ?? [];
            return items.length ? (
              <section key={t}>
                <h2>{TITULOS[t]}</h2>
                {items.map((i) => <div className="panel" key={i.id}><h3>{i.titulo}</h3><p>{i.contenido}</p></div>)}
              </section>
            ) : null;
          })}
          {!l.informacion?.length && <Vacio>Esta localidad aún no tiene información cultural publicada.</Vacio>}

          <h2>Actividades tradicionales</h2>
          {l.actividades?.length ? (
            <ul className="lista">{l.actividades.map((a) => <li key={a.id}><h3>{a.nombre}</h3><p>{a.descripcion}</p></li>)}</ul>
          ) : <Vacio>No hay actividades tradicionales registradas.</Vacio>}

          <h2>Emprendimientos de la localidad</h2>
          <Datos cargando={emp.cargando} error={emp.error}>
            {emp.data?.length ? (
              <ul className="chips">
                {emp.data.map((e) => (
                  <li key={e.id}><Link to={`/emprendimientos/${e.id}`}>{e.nombre}{e.sector && <small>Sector {e.sector.nombre}</small>}</Link></li>
                ))}
              </ul>
            ) : <Vacio>Todavía no hay emprendimientos aprobados aquí.</Vacio>}
          </Datos>
        </>
      )}
    </Datos>
  );
}
