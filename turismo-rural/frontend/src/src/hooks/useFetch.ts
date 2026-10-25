import { useEffect, useRef, useState } from 'react';
import { api, mensajeError } from '../api';

/** Carga datos de la API. Pasa url = null para no cargar todavía. */
export function useFetch<T>(url: string | null, params?: Record<string, any>) {
  const [data, setData] = useState<T | null>(null);
  const [cargando, setCargando] = useState(!!url);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);
  const llave = `${url}|${JSON.stringify(params ?? {})}`;
  const ultima = useRef('');

  useEffect(() => {
    if (!url) { setData(null); setCargando(false); ultima.current = ''; return; }
    let vivo = true;
    // Al recargar la misma consulta no se muestra "Cargando…", así no se pierde lo que el usuario está escribiendo.
    if (ultima.current !== llave) setCargando(true);
    ultima.current = llave;
    setError('');
    api.get<T>(url, { params })
      .then((r) => vivo && setData(r.data))
      .catch((e) => vivo && setError(mensajeError(e)))
      .finally(() => vivo && setCargando(false));
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [llave, tick]);

  return { data, cargando, error, recargar: () => setTick((t) => t + 1) };
}
