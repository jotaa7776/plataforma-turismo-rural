import { Link } from 'react-router-dom';
import { dinero } from '../../api';
import { Experiencia } from '../../types';

export default function TarjetaExperiencia({ e }: { e: Experiencia }) {
  const foto = e.imagenes?.[0];
  return (
    <Link to={`/experiencias/${e.id}`} className="tarjeta">
      {foto ? <img src={foto.url} alt={foto.descripcion || e.nombre} loading="lazy" decoding="async" /> : <div className="sin-foto">Sin foto</div>}
      <div className="tarjeta-cuerpo">
        <span className="tag">{e.tipo}</span>
        <h3>{e.nombre}</h3>
        <p className="suave">{e.emprendimiento?.nombre} · {e.emprendimiento?.localidad?.nombre}</p>
        <strong>{dinero(e.precio)} <small>por persona</small></strong>
      </div>
    </Link>
  );
}
