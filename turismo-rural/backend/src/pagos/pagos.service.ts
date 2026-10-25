import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioActual } from '../auth/auth.decorator';
import { EstadoReserva, Reserva } from '../reservas/reserva.entity';
import { PagarDto } from './dto/pagar.dto';
import { EstadoPago, Pago } from './pago.entity';
import { procesarPagoSimulado } from './pasarela-simulada';

// RF21 y RF26: medios y condiciones visibles, con alternativas para quienes no tienen cuenta bancaria.
const MEDIOS = [
  { id: 'tarjeta', nombre: 'Tarjeta de crédito o débito', condiciones: 'Pago inmediato. Requiere tarjeta.', requiereCuentaBancaria: true },
  { id: 'transferencia', nombre: 'Transferencia bancaria', condiciones: 'Se confirma al instante en esta simulación. Requiere cuenta bancaria.', requiereCuentaBancaria: true },
  { id: 'billetera', nombre: 'Billetera digital (por ejemplo, Cuenta RUT)', condiciones: 'Pago desde el celular, sin necesidad de cuenta corriente.', requiereCuentaBancaria: false },
  { id: 'efectivo', nombre: 'Efectivo en punto de pago', condiciones: 'Para quienes no tienen cuenta bancaria: se paga con un código en un punto de recaudación.', requiereCuentaBancaria: false },
];

@Injectable()
export class PagosService {
  constructor(
    @InjectRepository(Pago) private pagos: Repository<Pago>,
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
  ) {}

  medios() {
    return MEDIOS;
  }

  async pagar(user: UsuarioActual, dto: PagarDto) {
    const r = await this.reservas.findOne({ where: { id: dto.reservaId } });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    if (r.visitanteId !== user.id) throw new ForbiddenException('Esta reserva no es tuya');
    if (![EstadoReserva.PENDIENTE, EstadoReserva.ACEPTADA].includes(r.estado))
      throw new BadRequestException('Esta reserva ya no admite pago');

    const existente = await this.pagos.findOne({ where: { reservaId: r.id } });
    if (existente?.estado === EstadoPago.PAGADO) throw new ConflictException('Esta reserva ya está pagada');

    const resp = await procesarPagoSimulado({ monto: r.total, medio: dto.medioPago });
    const pago = existente ?? this.pagos.create({ reservaId: r.id });
    Object.assign(pago, {
      monto: r.total,
      medioPago: dto.medioPago,
      estado: resp.aprobado ? EstadoPago.PAGADO : EstadoPago.RECHAZADO, // RF23: se registra el estado
      referencia: resp.referencia,
    });
    return this.pagos.save(pago);
  }
}
