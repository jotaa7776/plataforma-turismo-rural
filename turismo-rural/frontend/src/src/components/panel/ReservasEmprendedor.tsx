import { useState } from 'react';
import { api, cuando, dinero, mensajeError } from '../../api';
import { useFetch } from '../../hooks/useFetch';
import { Reserva } from '../../types';
import { Aviso, Datos, EstadoTag, PagoTag, Vacio } from '../common/Estado';

export default function ReservasEmprendedor() {
  const { data, cargando, error, recargar } = useFetch<Reserva[]>('/reservas/emprendimiento');
  const [msg, setMsg] = useState('');

  const responder = async (id: string, que: 'aceptar' | 'rechazar') => {
    setMsg('');
    try { await api.patch(`/reservas/${id}/${que}`); recargar(); } catch (e) { setMsg(mensajeError(e)); }
  };

  return (
    <Datos cargando={cargando} error={error}>
      <Aviso>{msg}</Aviso>
      {data?.length ? (
        <ul className="lista">
          {data.map((r) => (
            <li key={r.id}>
              <div className="acciones"><strong>{r.experiencia?.nombre}</strong><EstadoTag estado={r.estado} /><PagoTag pago={r.pago} /></div>
              <p style={{ margin: 0 }}>{cuando(r)} · {r.cantidadPersonas} persona(s) · {dinero(r.total)}</p>
              <p className="suave" style={{ margin: 0 }}>Visitante: {r.visitante?.nombre} ({r.visitante?.correo})</p>
              {r.estado === 'pendiente' && (
                <div className="acciones">
                  <button className="btn" onClick={() => responder(r.id, 'aceptar')}>Aceptar</button>
                  <button className="btn peligro" onClick={() => responder(r.id, 'rechazar')}>Rechazar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : <Vacio>Todavía no recibes reservas.</Vacio>}
    </Datos>
  );
}
