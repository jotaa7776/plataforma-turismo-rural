import { Module } from '@nestjs/common';
import { EmprendimientosModule } from '../emprendimientos/emprendimientos.module';
import { ReservasModule } from '../reservas/reservas.module';
import { AdministracionController } from './administracion.controller';
import { AdministracionService } from './administracion.service';

@Module({
  imports: [EmprendimientosModule, ReservasModule],
  controllers: [AdministracionController],
  providers: [AdministracionService],
})
export class AdministracionModule {}
