import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService, private usuarios: UsuariosService) {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: config.get<string>('JWT_SECRET') });
  }
  async validate(payload: { sub: string }) {
    const u = await this.usuarios.buscarPorId(payload.sub);
    if (!u) throw new UnauthorizedException();
    return { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol };
  }
}
