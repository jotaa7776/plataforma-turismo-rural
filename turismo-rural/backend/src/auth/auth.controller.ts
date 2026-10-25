import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth, CurrentUser, UsuarioActual } from './auth.decorator';
import { LoginDto, RegistroDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private servicio: AuthService) {}

  @Post('registro') registro(@Body() dto: RegistroDto) { return this.servicio.registro(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.servicio.login(dto); }
  @Get('perfil') @Auth() perfil(@CurrentUser() u: UsuarioActual) { return u; }
}
