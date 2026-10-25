import { useParams } from 'react-router-dom';
import { Datos, Vacio } from '../components/common/Estado';
import Galeria from '../components/common/Galeria';
import TarjetaExperiencia from '../components/common/TarjetaExperiencia';
import { useFetch } from '../hooks/useFetch';
import { Emprendimiento, Experiencia } from '../types';

export default function PerfilEmprendimiento() {
  const { id } = useParams();
  const { data: e, cargando, error } = useFetch<Emprendimiento>(`/emprendimientos/${id}`);
  const exp = useFetch<Experiencia[]>('/experiencias', { emprendimientoId: id });

  return (
    <Datos cargando={cargando} error={error}>
      {e && (
        <>
          <h1 style={{ marginTop: '2rem' }}>{e.nombre}</h1>
          <p className="suave">{e.localidad?.nombre}{e.sector && ` · Sector ${e.sector.nombre}`}</p>
          <Galeria imagenes={e.imagenes} alt={e.nombre} />
          <p>{e.descripcion}</p>
          <p><strong>Contacto:</strong> {e.contacto}</p>
          <h2>Lo que ofrece</h2>
          <Datos cargando={exp.cargando} error={exp.error}>
            {exp.data?.length ? <div className="grilla">{exp.data.map((x) => <TarjetaExperiencia key={x.id} e={x} />)}</div>
              : <Vacio>Este emprendimiento aún no publica experiencias.</Vacio>}
          </Datos>
        </>
      )}
    </Datos>
  );
}
