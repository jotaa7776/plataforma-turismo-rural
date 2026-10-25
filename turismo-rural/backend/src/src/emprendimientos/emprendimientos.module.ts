import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Imagen } from '../oferta/entities';
import { TerritorioModule } from '../territorio/territorio.module';
import { Emprendimiento } from './emprendimiento.entity';
import { EmprendimientosController } from './emprendimientos.controller';
import { EmprendimientosService } from './emprendimientos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Emprendimiento, Imagen]), TerritorioModule],
  controllers: [EmprendimientosController],
  providers: [EmprendimientosService],
  exports: [EmprendimientosService, TypeOrmModule],
})
export class EmprendimientosModule {}
