import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { UsuarioActual } from '../auth/auth.decorator';
import { Imagen } from '../oferta/entities';
import { Localidad } from '../territorio/entities';
import { ActualizarEmprendimientoDto, CrearEmprendimientoDto } from './dto/emprendimiento.dto';
import { Emprendimiento, EstadoEmprendimiento } from './emprendimiento.entity';

const REL = { localidad: true, sector: true };

@Injectable()
export class EmprendimientosService {
  constructor(
    @InjectRepository(Emprendimiento) private repo: Repository<Emprendimiento>,
    @InjectRepository(Localidad) private localidades: Repository<Localidad>,
    @InjectRepository(Imagen) private imagenes: Repository<Imagen>,
  ) {}

  /** Agrega a cada emprendimiento sus fotos. */
  private async anexarImagenes(es: Emprendimiento[]) {
    if (!es.length) return es;
    const fotos = await this.imagenes.find({ where: { emprendimientoId: In(es.map((e) => e.id)) } });
    return es.map((e) => Object.assign(e, { imagenes: fotos.filter((i) => i.emprendimientoId === e.id) }));
  }

  async listarPublicos(f: { localidadId?: string; sectorId?: string; region?: string; comuna?: string }) {
    const where: FindOptionsWhere<Emprendimiento> = { estado: EstadoEmprendimiento.APROBADO };
    if (f.localidadId) where.localidadId = f.localidadId;
    if (f.sectorId) where.sectorId = f.sectorId;
    if (f.region || f.comuna) {
      where.localidad = {};
      if (f.region) where.localidad.region = f.region;
      if (f.comuna) where.localidad.nombre = f.comuna;
    }
    return this.anexarImagenes(await this.repo.find({ where, relations: REL, order: { nombre: 'ASC' } }));
  }

  async obtenerPublico(id: string) {
    const e = await this.repo.findOne({ where: { id, estado: EstadoEmprendimiento.APROBADO }, relations: REL });
    if (!e) throw new NotFoundException('Emprendimiento no encontrado');
    return (await this.anexarImagenes([e]))[0];
  }

  async mios(user: UsuarioActual) {
    return this.anexarImagenes(await this.repo.find({ where: { propietarioId: user.id }, relations: REL }));
  }

  async obtenerPropio(user: UsuarioActual, id: string) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Emprendimiento no encontrado');
    if (e.propietarioId !== user.id) throw new ForbiddenException('Este emprendimiento no es tuyo');
    return e;
  }

  async crear(user: UsuarioActual, dto: CrearEmprendimientoDto) {
    await this.validarLocalidad(dto.localidadId);
    return this.repo.save(this.repo.create({ ...dto, propietarioId: user.id }));
  }

  async actualizar(user: UsuarioActual, id: string, dto: ActualizarEmprendimientoDto) {
    const e = await this.obtenerPropio(user, id);
    if (dto.localidadId) await this.validarLocalidad(dto.localidadId);
    return this.repo.save(Object.assign(e, dto));
  }

  // --- usadas por administración ---
  listarPorEstado(estado?: EstadoEmprendimiento) {
    return this.repo.find({
      where: estado ? { estado } : {},
      relations: { localidad: true, propietario: true },
      order: { fechaCreacion: 'DESC' },
    });
  }
  async cambiarEstado(id: string, estado: EstadoEmprendimiento) {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Emprendimiento no encontrado');
    e.estado = estado;
    return this.repo.save(e);
  }

  private async validarLocalidad(id: string) {
    if (!(await this.localidades.findOne({ where: { id } }))) throw new BadRequestException('La localidad no existe');
  }
}
