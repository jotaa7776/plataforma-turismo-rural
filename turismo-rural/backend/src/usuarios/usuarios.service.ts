import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol } from '../common/roles.enum';
import { Usuario } from './usuario.entity';

@Injectable()
export class UsuariosService implements OnModuleInit {
  constructor(@InjectRepository(Usuario) private repo: Repository<Usuario>, private config: ConfigService) {}

  async onModuleInit() {
    const correo = this.config.get<string>('ADMIN_CORREO');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!correo || !password) return;
    if ((await this.repo.count({ where: { rol: Rol.ADMINISTRADOR } })) > 0) return;
    await this.crear({ nombre: 'Administrador', correo, password, rol: Rol.ADMINISTRADOR });
  }

  async crear(d: { nombre: string; correo: string; password: string; rol: Rol }) {
    const u = await this.repo.save(
      this.repo.create({ ...d, correo: d.correo.toLowerCase(), password: await bcrypt.hash(d.password, 10) }),
    );
    delete u.password;
    return u;
  }

  buscarPorCorreoConPassword(correo: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect('u.password')
      .where('u.correo = :correo', { correo: correo.toLowerCase() })
      .getOne();
  }
  buscarPorCorreo(correo: string) {
    return this.repo.findOne({ where: { correo: correo.toLowerCase() } });
  }
  buscarPorId(id: string) {
    return this.repo.findOne({ where: { id } });
  }
  listar() {
    return this.repo.find({ order: { fechaCreacion: 'DESC' } });
  }
}
