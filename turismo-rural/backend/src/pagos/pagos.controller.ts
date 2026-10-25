import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, CurrentUser, UsuarioActual } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import { PagarDto } from './dto/pagar.dto';
import { PagosService } from './pagos.service';

@ApiTags('pagos (simulados)')
@Controller('pagos')
export class PagosController {
  constructor(private s: PagosService) {}

  @Get('medios') medios() { return this.s.medios(); }

  @Post() @Auth(Rol.VISITANTE)
  pagar(@CurrentUser() u: UsuarioActual, @Body() dto: PagarDto) { return this.s.pagar(u, dto); }
}
