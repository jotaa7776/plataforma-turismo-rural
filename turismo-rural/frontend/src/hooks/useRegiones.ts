import { useEffect, useState } from 'react';
import { api } from '../api';
import { Region } from '../types';

// El listado de regiones y comunas se pide una sola vez y se reutiliza en toda la app.
let cache: Region[] | null = null;
let pendiente: Promise<Region[]> | null = null;

export function useRegiones() {
  const [regiones, setRegiones] = useState<Region[]>(cache ?? []);
  useEffect(() => {
    if (cache) { setRegiones(cache); return; }
    if (!pendiente) pendiente = api.get<Region[]>('/localidades/regiones').then((r) => r.data);
    let vivo = true;
    pendiente
      .then((d) => { cache = d; if (vivo) setRegiones(d); })
      .catch(() => { pendiente = null; });
    return () => { vivo = false; };
  }, []);
  return regiones;
}
