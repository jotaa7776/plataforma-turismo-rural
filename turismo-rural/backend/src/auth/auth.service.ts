import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto, RegistroDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private usuarios: UsuariosService, private jwt: JwtService) {}

  async registro(dto: RegistroDto) {
    if (await this.usuarios.buscarPorCorreo(dto.correo)) throw new ConflictException('Ese correo ya está registrado');
    return this.respuesta(await this.usuarios.crear(dto));
  }

  async login(dto: LoginDto) {
    const u = await this.usuarios.buscarPorCorreoConPassword(dto.correo);
    if (!u || !(await bcrypt.compare(dto.password, u.password)))
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    return this.respuesta(u);
  }

  private respuesta(u: { id: string; nombre: string; correo: string; rol: string }) {
    return {
      token: this.jwt.sign({ sub: u.id, rol: u.rol }),
      usuario: { id: u.id, nombre: u.nombre, correo: u.correo, rol: u.rol },
    };
  }
}
