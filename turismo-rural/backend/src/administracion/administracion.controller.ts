import { Controller, Get, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import { EstadoEmprendimiento } from '../emprendimientos/emprendimiento.entity';
import { EstadoReserva } from '../reservas/reserva.entity';
import { AdministracionService } from './administracion.service';

@ApiTags('administración')
@Controller('admin')
@Auth(Rol.ADMINISTRADOR)
export class AdministracionController {
  constructor(private s: AdministracionService) {}

  @Get('emprendimientos')
  emprendimientos(@Query('estado', new ParseEnumPipe(EstadoEmprendimiento, { optional: true })) estado?: EstadoEmprendimiento) {
    return this.s.listarEmprendimientos(estado);
  }
  @Patch('emprendimientos/:id/aprobar')
  aprobar(@Param('id', ParseUUIDPipe) id: string) { return this.s.cambiarEstado(id, EstadoEmprendimiento.APROBADO); }
  @Patch('emprendimientos/:id/rechazar')
  rechazar(@Param('id', ParseUUIDPipe) id: string) { return this.s.cambiarEstado(id, EstadoEmprendimiento.RECHAZADO); }

  @Get('reservas')
  reservas(@Query('estado', new ParseEnumPipe(EstadoReserva, { optional: true })) estado?: EstadoReserva) {
    return this.s.listarReservas(estado);
  }
  @Get('indicadores') indicadores() { return this.s.indicadores(); }
}
