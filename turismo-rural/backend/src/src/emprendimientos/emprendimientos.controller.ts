import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { Auth, CurrentUser, UsuarioActual } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import { ActualizarEmprendimientoDto, CrearEmprendimientoDto } from './dto/emprendimiento.dto';
import { EmprendimientosService } from './emprendimientos.service';

class FiltroDto {
  @IsOptional() @IsUUID() localidadId?: string;
  @IsOptional() @IsUUID() sectorId?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() comuna?: string;
}

@ApiTags('emprendimientos')
@Controller('emprendimientos')
export class EmprendimientosController {
  constructor(private s: EmprendimientosService) {}

  @Get() listar(@Query() f: FiltroDto) { return this.s.listarPublicos(f); }
  @Get('mios') @Auth(Rol.EMPRENDEDOR) mios(@CurrentUser() u: UsuarioActual) { return this.s.mios(u); }
  @Get(':id') obtener(@Param('id', ParseUUIDPipe) id: string) { return this.s.obtenerPublico(id); }

  @Post() @Auth(Rol.EMPRENDEDOR)
  crear(@CurrentUser() u: UsuarioActual, @Body() dto: CrearEmprendimientoDto) { return this.s.crear(u, dto); }

  @Patch(':id') @Auth(Rol.EMPRENDEDOR)
  actualizar(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarEmprendimientoDto) {
    return this.s.actualizar(u, id, dto);
  }
}
