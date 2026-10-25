import { useState } from 'react';
import { api, mensajeError } from '../../api';
import { Aviso } from '../common/Estado';

/** Sube una o varias fotos (se optimizan en el servidor). campo: experienciaId | rutaId | emprendimientoId */
export default function SubirImagen({ campo, id, onListo }: { campo: string; id: string; onListo: () => void }) {
  const [msg, setMsg] = useState('');
  const [subiendo, setSubiendo] = useState(false);

  const subir = async (files: FileList | null) => {
    if (!files?.length) return;
    setSubiendo(true);
    setMsg('');
    const fallidas: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('archivo', file);
      fd.append(campo, id);
      try { await api.post('/imagenes', fd); } catch (e) { fallidas.push(`${file.name}: ${mensajeError(e)}`); }
    }
    setSubiendo(false);
    setMsg(fallidas.join(' · '));
    onListo();
  };

  return (
    <div>
      <label>Agregar fotos (JPG, PNG o WebP, hasta 8 MB cada una)
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={subiendo}
          onChange={(e) => { subir(e.target.files); e.target.value = ''; }} />
      </label>
      {subiendo && <p className="suave">Subiendo y optimizando…</p>}
      <Aviso>{msg}</Aviso>
    </div>
  );
}
