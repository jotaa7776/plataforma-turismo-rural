import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from '../reservas/reserva.entity';
import { Pago } from './pago.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Pago, Reserva])],
  controllers: [PagosController],
  providers: [PagosService],
})
export class PagosModule {}
