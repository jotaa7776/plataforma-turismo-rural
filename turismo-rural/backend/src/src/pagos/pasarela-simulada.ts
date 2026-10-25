import { randomUUID } from 'crypto';

/**
 * Pasarela de pago SIMULADA: no cobra dinero ni se conecta a ningún servicio externo.
 * Para integrar una pasarela real (Webpay, Mercado Pago, etc.) solo hay que reemplazar esta función
 * por la llamada HTTPS al proveedor; el resto del módulo no cambia.
 */
export async function procesarPagoSimulado(_: { monto: number; medio: string }) {
  await new Promise((r) => setTimeout(r, 800)); // simula la espera de la pasarela
  return { aprobado: true, referencia: `SIM-${randomUUID().slice(0, 8).toUpperCase()}` };
}
