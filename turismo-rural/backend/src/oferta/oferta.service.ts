import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UsuarioActual } from '../auth/auth.decorator';
import { Emprendimiento, EstadoEmprendimiento } from '../emprendimientos/emprendimiento.entity';
import {
  ActualizarExperienciaDto, ActualizarRutaDto, CrearExperienciaDto, CrearRutaDto, FiltroOfertaDto, SubirImagenDto,
} from './dto/oferta.dto';
import { Experiencia, Imagen, Ruta } from './entities';

export const UPLOADS = join(process.cwd(), 'uploads');
const REL_EXP = { emprendimiento: { localidad: true }, ruta: true, imagenes: true };
const REL_RUTA = { emprendimiento: { localidad: true }, imagenes: true };

@Injectable()
export class OfertaService {
  constructor(
    @InjectRepository(Experiencia) private experiencias: Repository<Experiencia>,
    @InjectRepository(Ruta) private rutas: Repository<Ruta>,
    @InjectRepository(Imagen) private imagenes: Repository<Imagen>,
    @InjectRepository(Emprendimiento) private emprendimientos: Repository<Emprendimiento>,
  ) {}

  private filtroEmp(f: FiltroOfertaDto) {
    const emp: FindOptionsWhere<Emprendimiento> = { estado: EstadoEmprendimiento.APROBADO };
    if (f.localidadId) emp.localidadId = f.localidadId;
    if (f.emprendimientoId) emp.id = f.emprendimientoId;
    if (f.region || f.comuna) {
      emp.localidad = {};
      if (f.region) emp.localidad.region = f.region;
      if (f.comuna) emp.localidad.nombre = f.comuna;
    }
    return emp;
  }
  private async asegurarEmprendimiento(user: UsuarioActual, id: string) {
    const e = await this.emprendimientos.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Emprendimiento no encontrado');
    if (e.propietarioId !== user.id) throw new ForbiddenException('Este emprendimiento no es tuyo');
    return e;
  }

  // ---------- experiencias ----------
  listarExperiencias(f: FiltroOfertaDto) {
    const where: FindOptionsWhere<Experiencia> = { emprendimiento: this.filtroEmp(f) };
    if (f.tipo) where.tipo = f.tipo;
    return this.experiencias.find({ where, relations: REL_EXP, order: { nombre: 'ASC' } });
  }
  misExperiencias(user: UsuarioActual) {
    return this.experiencias.find({ where: { emprendimiento: { propietarioId: user.id } }, relations: REL_EXP });
  }
  async obtenerExperiencia(id: string) {
    const e = await this.experiencias.findOne({
      where: { id, emprendimiento: { estado: EstadoEmprendimiento.APROBADO } },
      relations: REL_EXP,
    });
    if (!e) throw new NotFoundException('Experiencia no encontrada');
    return e;
  }
  async crearExperiencia(user: UsuarioActual, dto: CrearExperienciaDto) {
    await this.asegurarEmprendimiento(user, dto.emprendimientoId);
    if (dto.rutaId) {
      const r = await this.rutas.findOne({ where: { id: dto.rutaId, emprendimientoId: dto.emprendimientoId } });
      if (!r) throw new BadRequestException('La ruta no existe en este emprendimiento');
    }
    return this.experiencias.save(this.experiencias.create(dto));
  }
  async actualizarExperiencia(user: UsuarioActual, id: string, dto: ActualizarExperienciaDto) {
    const e = await this.experiencias.findOne({ where: { id } });
    if (!e) throw new NotFoundException('Experiencia no encontrada');
    await this.asegurarEmprendimiento(user, e.emprendimientoId);
    return this.experiencias.save(Object.assign(e, dto));
  }

  // ---------- rutas ----------
  listarRutas(f: FiltroOfertaDto) {
    return this.rutas.find({ where: { emprendimiento: this.filtroEmp(f) }, relations: REL_RUTA, order: { nombre: 'ASC' } });
  }
  misRutas(user: UsuarioActual) {
    return this.rutas.find({ where: { emprendimiento: { propietarioId: user.id } }, relations: REL_RUTA });
  }
  async obtenerRuta(id: string) {
    const r = await this.rutas.findOne({
      where: { id, emprendimiento: { estado: EstadoEmprendimiento.APROBADO } },
      relations: REL_RUTA,
    });
    if (!r) throw new NotFoundException('Ruta no encontrada');
    return r;
  }
  async crearRuta(user: UsuarioActual, dto: CrearRutaDto) {
    await this.asegurarEmprendimiento(user, dto.emprendimientoId);
    return this.rutas.save(this.rutas.create(dto));
  }
  async actualizarRuta(user: UsuarioActual, id: string, dto: ActualizarRutaDto) {
    const r = await this.rutas.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Ruta no encontrada');
    await this.asegurarEmprendimiento(user, r.emprendimientoId);
    return this.rutas.save(Object.assign(r, dto));
  }

  // ---------- imágenes (se comprimen a WebP de máx. 1280 px para conexiones lentas) ----------
  async subirImagen(user: UsuarioActual, archivo: Express.Multer.File, dto: SubirImagenDto) {
    if (!archivo) throw new BadRequestException('Envía una imagen JPG, PNG o WebP');
    if ([dto.experienciaId, dto.rutaId, dto.emprendimientoId].filter(Boolean).length !== 1)
      throw new BadRequestException('Indica un solo destino: experienciaId, rutaId o emprendimientoId');

    let empId = dto.emprendimientoId;
    if (dto.experienciaId) empId = (await this.experiencias.findOne({ where: { id: dto.experienciaId } }))?.emprendimientoId;
    if (dto.rutaId) empId = (await this.rutas.findOne({ where: { id: dto.rutaId } }))?.emprendimientoId;
    if (!empId) throw new NotFoundException('Destino no encontrado');
    await this.asegurarEmprendimiento(user, empId);

    await mkdir(UPLOADS, { recursive: true });
    const nombre = `${randomUUID()}.webp`;
    await sharp(archivo.buffer).rotate().resize({ width: 1280, withoutEnlargement: true }).webp({ quality: 75 }).toFile(join(UPLOADS, nombre));
    return this.imagenes.save(
      this.imagenes.create({
        url: `/uploads/${nombre}`,
        descripcion: dto.descripcion,
        experienciaId: dto.experienciaId,
        rutaId: dto.rutaId,
        emprendimientoId: dto.emprendimientoId,
      }),
    );
  }

  async eliminarImagen(user: UsuarioActual, id: string) {
    const img = await this.imagenes.findOne({ where: { id }, relations: { experiencia: true, ruta: true } });
    if (!img) throw new NotFoundException('Imagen no encontrada');
    const empId = img.emprendimientoId ?? img.experiencia?.emprendimientoId ?? img.ruta?.emprendimientoId;
    await this.asegurarEmprendimiento(user, empId);
    await this.imagenes.remove(img);
    await unlink(join(process.cwd(), img.url)).catch(() => undefined);
    return { eliminada: true };
  }
}
