import { useState } from 'react';
import { Datos } from '../components/common/Estado';
import { EstadoTag } from '../components/common/Estado';
import EmprendimientoForm from '../components/panel/EmprendimientoForm';
import GaleriaEditable from '../components/panel/GaleriaEditable';
import OfertaPanel from '../components/panel/OfertaPanel';
import ReservasEmprendedor from '../components/panel/ReservasEmprendedor';
import SubirImagen from '../components/panel/SubirImagen';
import TerritorioForm from '../components/panel/TerritorioForm';
import { useFetch } from '../hooks/useFetch';
import { Emprendimiento } from '../types';

const TABS = [
  ['emprendimiento', 'Mi emprendimiento'], ['territorio', 'Localidad e identidad'],
  ['oferta', 'Oferta turística'], ['reservas', 'Reservas'],
] as const;

export default function PanelEmprendedor() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>('emprendimiento');
  const { data, cargando, error, recargar } = useFetch<Emprendimiento[]>('/emprendimientos/mios');
  const emp = data?.[0];

  return (
    <>
      <h1 style={{ marginTop: '2rem' }}>Panel del emprendedor {emp && <EstadoTag estado={emp.estado} />}</h1>
      {emp?.estado === 'pendiente' && <p className="aviso">Tu emprendimiento está en revisión. Puedes preparar tu oferta, pero será visible cuando un administrador lo apruebe.</p>}
      {emp?.estado === 'rechazado' && <p className="aviso error">Tu emprendimiento fue rechazado. Corrige los datos y contacta al administrador.</p>}
      <div className="tabs" role="tablist">
        {TABS.map(([k, t]) => (
          <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} disabled={!emp && (k === 'oferta' || k === 'reservas')}>{t}</button>
        ))}
      </div>
      <Datos cargando={cargando} error={error}>
        {tab === 'emprendimiento' && (
          <>
            <EmprendimientoForm key={emp?.id ?? 'nuevo'} emp={emp} onGuardado={recargar} />
            {emp && (
              <div className="panel">
                <h3>Fotos del emprendimiento</h3>
                <p className="suave">Estas fotos se muestran en el perfil público de tu emprendimiento.</p>
                <GaleriaEditable imagenes={emp.imagenes} onCambio={recargar} />
                <SubirImagen campo="emprendimientoId" id={emp.id} onListo={recargar} />
              </div>
            )}
          </>
        )}
        {tab === 'territorio' && <TerritorioForm />}
        {tab === 'oferta' && emp && <OfertaPanel emp={emp} />}
        {tab === 'reservas' && emp && <ReservasEmprendedor />}
      </Datos>
    </>
  );
}
