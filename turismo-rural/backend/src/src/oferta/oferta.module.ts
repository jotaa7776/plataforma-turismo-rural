import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmprendimientosModule } from '../emprendimientos/emprendimientos.module';
import { Experiencia, Imagen, Ruta } from './entities';
import { OfertaController } from './oferta.controller';
import { OfertaService } from './oferta.service';

@Module({
  imports: [TypeOrmModule.forFeature([Experiencia, Ruta, Imagen]), EmprendimientosModule],
  controllers: [OfertaController],
  providers: [OfertaService],
  exports: [TypeOrmModule],
})
export class OfertaModule {}
