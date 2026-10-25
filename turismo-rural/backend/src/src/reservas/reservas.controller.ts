import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, CurrentUser, UsuarioActual } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import { CrearReservaDto, DisponibilidadDto, ModificarReservaDto } from './dto/reserva.dto';
import { EstadoReserva } from './reserva.entity';
import { ReservasService } from './reservas.service';

@ApiTags('reservas')
@Controller('reservas')
export class ReservasController {
  constructor(private s: ReservasService) {}

  @Get('disponibilidad') disponibilidad(@Query() q: DisponibilidadDto) { return this.s.disponibilidad(q); }
  @Get('mias') @Auth(Rol.VISITANTE) mias(@CurrentUser() u: UsuarioActual) { return this.s.mias(u); }
  @Get('emprendimiento') @Auth(Rol.EMPRENDEDOR) delEmprendedor(@CurrentUser() u: UsuarioActual) { return this.s.delEmprendedor(u); }

  @Get(':id') @Auth(Rol.VISITANTE)
  obtener(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string) { return this.s.obtenerMia(u, id); }

  @Post() @Auth(Rol.VISITANTE)
  crear(@CurrentUser() u: UsuarioActual, @Body() dto: CrearReservaDto) { return this.s.crear(u, dto); }

  @Patch(':id') @Auth(Rol.VISITANTE)
  modificar(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ModificarReservaDto) {
    return this.s.modificar(u, id, dto);
  }
  @Patch(':id/cancelar') @Auth(Rol.VISITANTE)
  cancelar(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string) { return this.s.cancelar(u, id); }

  @Patch(':id/aceptar') @Auth(Rol.EMPRENDEDOR)
  aceptar(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string) { return this.s.responder(u, id, EstadoReserva.ACEPTADA); }
  @Patch(':id/rechazar') @Auth(Rol.EMPRENDEDOR)
  rechazar(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string) { return this.s.responder(u, id, EstadoReserva.RECHAZADA); }
}
