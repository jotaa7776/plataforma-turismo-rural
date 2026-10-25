import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFetch } from '../../hooks/useFetch';
import { LocalidadDestacada } from '../../types';

/**
 * Carrusel público de localidades con oferta aprobada. Muestra la foto más reciente de cada una
 * y se vuelve a consultar cada minuto, así aparecen las fotos nuevas sin recargar la página.
 */
export default function CarruselLocalidades() {
  const { data, recargar } = useFetch<LocalidadDestacada[]>('/localidades/destacadas');
  const [i, setI] = useState(0);
  const [pausa, setPausa] = useState(false);
  const total = data?.length ?? 0;
  const reducirMovimiento = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const t = setInterval(recargar, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (total <= 1 || pausa || reducirMovimiento) return;
    const t = setInterval(() => setI((x) => (x + 1) % total), 5000);
    return () => clearInterval(t);
  }, [total, pausa, reducirMovimiento]);

  if (!data?.length) return null;
  const idx = i % total;
  const l = data[idx];
  const mover = (d: number) => setI((idx + d + total) % total);

  return (
    <section
      className="carrusel"
      aria-roledescription="carrusel"
      aria-label="Localidades con experiencias disponibles"
      onMouseEnter={() => setPausa(true)}
      onMouseLeave={() => setPausa(false)}
      onFocus={() => setPausa(true)}
      onBlur={() => setPausa(false)}
    >
      <Link to={`/localidades/${l.id}`} className="carrusel-slide" aria-live={pausa ? 'polite' : 'off'}>
        {l.url ? <img src={l.url} alt={`Foto de ${l.nombre}`} decoding="async" /> : <div className="sin-foto grande">Aún sin fotos</div>}
        <div className="carrusel-texto">
          <strong>{l.nombre}</strong>
          <span>{l.region} · {l.emprendimientos} {l.emprendimientos === 1 ? 'emprendimiento' : 'emprendimientos'}</span>
        </div>
      </Link>
      {total > 1 && (
        <>
          <button type="button" className="carrusel-btn ant" aria-label="Localidad anterior" onClick={() => mover(-1)}>‹</button>
          <button type="button" className="carrusel-btn sig" aria-label="Localidad siguiente" onClick={() => mover(1)}>›</button>
          <div className="carrusel-puntos">
            {data.map((d, n) => (
              <button key={d.id} type="button" aria-label={`Ir a ${d.nombre}`} aria-current={n === idx} onClick={() => setI(n)} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
