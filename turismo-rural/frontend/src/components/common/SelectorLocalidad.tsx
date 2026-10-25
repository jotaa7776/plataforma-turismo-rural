import { useRegiones } from '../../hooks/useRegiones';

interface Props {
  region: string;
  comuna: string;
  onChange: (region: string, comuna: string) => void;
  /** true: región y comuna son obligatorias (formularios). false: filtros opcionales. */
  requerido?: boolean;
}

/** Selector de localidad: primero la región y luego la comuna (16 regiones, 346 comunas de Chile). */
export default function SelectorLocalidad({ region, comuna, onChange, requerido = false }: Props) {
  const regiones = useRegiones();
  const comunas = regiones.find((r) => r.nombre === region)?.comunas ?? [];

  return (
    <div className="fila">
      <label>Región
        <select required={requerido} value={region} onChange={(e) => onChange(e.target.value, '')}>
          <option value="">{requerido ? 'Selecciona una región…' : 'Todas las regiones'}</option>
          {regiones.map((r) => <option key={r.nombre} value={r.nombre}>{r.nombre}</option>)}
        </select>
      </label>
      <label>Comuna
        <select required={requerido} value={comuna} disabled={!region} onChange={(e) => onChange(region, e.target.value)}>
          <option value="">{requerido ? 'Selecciona una comuna…' : 'Todas las comunas'}</option>
          {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
    </div>
  );
}
