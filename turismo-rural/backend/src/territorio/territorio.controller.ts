import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import {
  CrearActividadDto, CrearInformacionDto, CrearLocalidadDto, CrearSectorDto, FiltroLocalidadDto,
} from './dto/territorio.dto';
import { TerritorioService } from './territorio.service';

@ApiTags('territorio')
@Controller('localidades')
export class TerritorioController {
  constructor(private s: TerritorioService) {}

  @Get('regiones') regiones() { return this.s.regiones(); }
  @Get() listar(@Query() f: FiltroLocalidadDto) { return this.s.listar(f); }
  @Get(':id') obtener(@Param('id', ParseUUIDPipe) id: string) { return this.s.obtener(id); }

  @Post() @Auth(Rol.EMPRENDEDOR, Rol.ADMINISTRADOR)
  crear(@Body() dto: CrearLocalidadDto) { return this.s.crear(dto); }

  @Post(':id/cultura') @Auth(Rol.EMPRENDEDOR, Rol.ADMINISTRADOR)
  cultura(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CrearInformacionDto) { return this.s.agregarInformacion(id, dto); }

  @Post(':id/actividades') @Auth(Rol.EMPRENDEDOR, Rol.ADMINISTRADOR)
  actividad(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CrearActividadDto) { return this.s.agregarActividad(id, dto); }

  @Post(':id/sectores') @Auth(Rol.EMPRENDEDOR, Rol.ADMINISTRADOR)
  sector(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CrearSectorDto) { return this.s.agregarSector(id, dto); }
}
