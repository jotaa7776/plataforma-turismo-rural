import { IsEnum, IsUUID } from 'class-validator';
import { MedioPago } from '../pago.entity';

export class PagarDto {
  @IsUUID() reservaId: string;
  @IsEnum(MedioPago, { message: 'Selecciona un medio de pago válido' }) medioPago: MedioPago;
}
