import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, cuando, dinero, mensajeError } from '../api';
import { Aviso, Datos } from '../components/common/Estado';
import { useFetch } from '../hooks/useFetch';
import { Reserva } from '../types';

interface Medio { id: string; nombre: string; condiciones: string; requiereCuentaBancaria: boolean }

export default function Pago() {
  const { id } = useParams();
  const reserva = useFetch<Reserva>(`/reservas/${id}`);
  const medios = useFetch<Medio[]>('/pagos/medios');
  const [medio, setMedio] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const r = reserva.data;

  const pagar = async () => {
    setProcesando(true);
    setError('');
    try {
      await api.post('/pagos', { reservaId: id, medioPago: medio });
      reserva.recargar();
    } catch (e) { setError(mensajeError(e)); }
    setProcesando(false);
  };

  return (
    <div className="pasarela">
      <Datos cargando={reserva.cargando} error={reserva.error}>
        {r && r.pago?.estado === 'pagado' ? (
          <section className="pagado-caja" role="status">
            <h1>Pagado</h1>
            <p>Tu pago de <strong>{dinero(r.pago.monto)}</strong> fue recibido.</p>
            <p className="suave">{r.experiencia?.nombre} · {cuando(r)} · {r.cantidadPersonas} persona(s)</p>
            <p className="suave">Referencia: {r.pago.referencia} · Medio: {medios.data?.find((m) => m.id === r.pago!.medioPago)?.nombre ?? r.pago.medioPago}</p>
            <p>El emprendedor ya puede ver tu reserva y la confirmará pronto.</p>
            <Link className="btn" to="/mis-reservas">Ver mis reservas</Link>
          </section>
        ) : r && (
          <>
            <h1>Pagar reserva</h1>
            <p className="simulacion">Pasarela de pago simulada: no se cobra dinero real.</p>
            <div className="panel">
              <h3>{r.experiencia?.nombre}</h3>
              <p style={{ margin: 0 }}>{cuando(r)} · {r.cantidadPersonas} persona(s)</p>
              <p style={{ margin: '.5rem 0 0' }}><strong>Total a pagar: {dinero(r.total)}</strong></p>
            </div>

            {r.estado === 'cancelada' || r.estado === 'rechazada' ? (
              <Aviso>Esta reserva está {r.estado} y ya no admite pago.</Aviso>
            ) : (
              <>
                <Datos cargando={medios.cargando} error={medios.error}>
                  <fieldset className="medios">
                    <legend>Elige cómo pagar</legend>
                    {medios.data?.map((m) => (
                      <label key={m.id} className="medio">
                        <input type="radio" name="medio" value={m.id} checked={medio === m.id} onChange={() => setMedio(m.id)} />
                        <span><strong>{m.nombre}</strong><small>{m.condiciones}</small></span>
                      </label>
                    ))}
                  </fieldset>
                </Datos>
                <Aviso>{error}</Aviso>
                <p style={{ marginTop: '1rem' }}>
                  <button className="btn" disabled={!medio || procesando} onClick={pagar}>
                    {procesando ? 'Procesando pago…' : `Pagar ${dinero(r.total)}`}
                  </button>{' '}
                  <Link to="/mis-reservas">Pagar más tarde</Link>
                </p>
              </>
            )}
          </>
        )}
      </Datos>
    </div>
  );
}
