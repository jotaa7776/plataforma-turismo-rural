import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import { UsuariosService } from './usuarios.service';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private servicio: UsuariosService) {}

  @Get()
  @Auth(Rol.ADMINISTRADOR)
  listar() {
    return this.servicio.listar();
  }
}
