import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OfertaModule } from '../oferta/oferta.module';
import { Pago } from '../pagos/pago.entity';
import { Reserva } from './reserva.entity';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reserva, Pago]), OfertaModule],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService, TypeOrmModule],
})
export class ReservasModule {}
