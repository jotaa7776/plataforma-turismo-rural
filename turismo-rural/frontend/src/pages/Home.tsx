import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Datos, Vacio } from '../components/common/Estado';
import SelectorLocalidad from '../components/common/SelectorLocalidad';
import TarjetaExperiencia from '../components/common/TarjetaExperiencia';
import { useFetch } from '../hooks/useFetch';
import { Experiencia, Localidad } from '../types';

export default function Home() {
  const nav = useNavigate();
  const [sel, setSel] = useState({ region: '', comuna: '' });
  const loc = useFetch<Localidad[]>('/localidades');
  const exp = useFetch<Experiencia[]>('/experiencias');

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams();
    if (sel.region) p.set('region', sel.region);
    if (sel.comuna) p.set('comuna', sel.comuna);
    nav(`/catalogo${p.toString() ? `?${p}` : ''}`);
  };

  return (
    <>
      <section className="hero">
        <h1>Experiencias que cuentan quienes viven en cada localidad</h1>
        <p>Conoce las tradiciones, recorre las rutas y reserva directo con las familias y emprendedores del territorio.</p>
        <form className="buscador" onSubmit={buscar}>
          <SelectorLocalidad region={sel.region} comuna={sel.comuna} onChange={(region, comuna) => setSel({ region, comuna })} />
          <button className="btn">Ver servicios</button>
        </form>
      </section>

      <h2>Localidades</h2>
      <Datos cargando={loc.cargando} error={loc.error}>
        {loc.data?.length ? (
          <ul className="chips">
            {loc.data.map((l) => (
              <li key={l.id}><Link to={`/localidades/${l.id}`}>{l.nombre}<small>{l.region}</small></Link></li>
            ))}
          </ul>
        ) : <Vacio>Todavía no hay localidades registradas.</Vacio>}
      </Datos>

      <h2>Experiencias disponibles</h2>
      <Datos cargando={exp.cargando} error={exp.error}>
        {exp.data?.length ? (
          <div className="grilla">{exp.data.slice(0, 6).map((e) => <TarjetaExperiencia key={e.id} e={e} />)}</div>
        ) : <Vacio>Aún no hay experiencias publicadas. Los emprendedores aprobados aparecerán aquí.</Vacio>}
      </Datos>
    </>
  );
}
