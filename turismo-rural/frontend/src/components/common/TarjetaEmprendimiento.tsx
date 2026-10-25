import { Link } from 'react-router-dom';
import { Emprendimiento } from '../../types';

export default function TarjetaEmprendimiento({ e }: { e: Emprendimiento }) {
  const foto = e.imagenes?.[0];
  return (
    <Link to={`/emprendimientos/${e.id}`} className="tarjeta">
      {foto ? <img src={foto.url} alt={foto.descripcion || e.nombre} loading="lazy" decoding="async" /> : <div className="sin-foto">Sin foto</div>}
      <div className="tarjeta-cuerpo">
        <h3>{e.nombre}</h3>
        <p className="suave">{e.localidad?.nombre}, {e.localidad?.region}</p>
      </div>
    </Link>
  );
}
