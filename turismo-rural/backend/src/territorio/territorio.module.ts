import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadTradicional, InformacionCultural, Localidad, Sector } from './entities';
import { TerritorioController } from './territorio.controller';
import { TerritorioService } from './territorio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Localidad, InformacionCultural, ActividadTradicional, Sector])],
  controllers: [TerritorioController],
  providers: [TerritorioService],
  exports: [TypeOrmModule],
})
export class TerritorioModule {}
