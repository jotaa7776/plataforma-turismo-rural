import { useState } from 'react';
import { api, mensajeError } from '../../api';
import { Imagen } from '../../types';
import { Aviso } from '../common/Estado';

/** Galería con botón para eliminar cada foto (solo para el dueño). */
export default function GaleriaEditable({ imagenes, onCambio }: { imagenes?: Imagen[]; onCambio: () => void }) {
  const [error, setError] = useState('');

  const eliminar = async (id: string) => {
    if (!window.confirm('¿Eliminar esta foto?')) return;
    setError('');
    try { await api.delete(`/imagenes/${id}`); onCambio(); } catch (e) { setError(mensajeError(e)); }
  };

  if (!imagenes?.length) return <p className="suave">Todavía no hay fotos.</p>;
  return (
    <>
      <div className="galeria">
        {imagenes.map((i) => (
          <figure key={i.id} className="foto">
            <img src={i.url} alt={i.descripcion || 'Foto'} loading="lazy" decoding="async" />
            <button type="button" className="btn peligro mini" onClick={() => eliminar(i.id)}>Eliminar</button>
          </figure>
        ))}
      </div>
      <Aviso>{error}</Aviso>
    </>
  );
}
