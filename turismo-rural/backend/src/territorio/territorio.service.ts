import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { ActividadTradicional, InformacionCultural, Localidad, Sector } from './entities';
import { REGIONES } from './chile';
import {
  CrearActividadDto, CrearInformacionDto, CrearLocalidadDto, CrearSectorDto, FiltroLocalidadDto,
} from './dto/territorio.dto';

@Injectable()
export class TerritorioService {
  constructor(
    @InjectRepository(Localidad) private localidades: Repository<Localidad>,
    @InjectRepository(InformacionCultural) private info: Repository<InformacionCultural>,
    @InjectRepository(ActividadTradicional) private actividades: Repository<ActividadTradicional>,
    @InjectRepository(Sector) private sectores: Repository<Sector>,
    private ds: DataSource,
  ) {}

  /**
   * Para el carrusel de la página principal: localidades que tienen al menos un emprendimiento aprobado,
   * con la foto más reciente subida en ellas (del emprendimiento, de sus experiencias o de sus rutas).
   * Se calcula en cada consulta, así que se actualiza apenas alguien sube una foto nueva.
   */
  async destacadas() {
    const filas = await this.ds.query(`
      WITH fotos AS (
        SELECT i.url, i.fecha, e."localidadId" AS loc FROM imagenes i
          JOIN emprendimientos e ON e.id = i."emprendimientoId" WHERE e.estado = 'aprobado'
        UNION ALL
        SELECT i.url, i.fecha, e."localidadId" FROM imagenes i
          JOIN experiencias x ON x.id = i."experienciaId"
          JOIN emprendimientos e ON e.id = x."emprendimientoId" WHERE e.estado = 'aprobado'
        UNION ALL
        SELECT i.url, i.fecha, e."localidadId" FROM imagenes i
          JOIN rutas r ON r.id = i."rutaId"
          JOIN emprendimientos e ON e.id = r."emprendimientoId" WHERE e.estado = 'aprobado'
      )
      SELECT l.id, l.nombre, l.region,
        (SELECT f.url FROM fotos f WHERE f.loc = l.id ORDER BY f.fecha DESC LIMIT 1) AS url,
        (SELECT MAX(f.fecha) FROM fotos f WHERE f.loc = l.id) AS ultima,
        (SELECT COUNT(*) FROM emprendimientos e WHERE e."localidadId" = l.id AND e.estado = 'aprobado') AS emprendimientos
      FROM localidades l
      WHERE EXISTS (SELECT 1 FROM emprendimientos e WHERE e."localidadId" = l.id AND e.estado = 'aprobado')
      ORDER BY ultima DESC NULLS LAST, l.nombre
      LIMIT 12`);
    return filas.map((f: any) => ({
      id: f.id, nombre: f.nombre, region: f.region, url: f.url, emprendimientos: Number(f.emprendimientos),
    }));
  }

  regiones() {
    return REGIONES;
  }
  listar(f: FiltroLocalidadDto = {}) {
    const where: FindOptionsWhere<Localidad> = {};
    if (f.region) where.region = f.region;
    if (f.comuna) where.nombre = f.comuna;
    return this.localidades.find({ where, order: { region: 'ASC', nombre: 'ASC' } });
  }
  async obtener(id: string) {
    const l = await this.localidades.findOne({
      where: { id },
      relations: { informacion: true, actividades: true, sectores: true },
    });
    if (!l) throw new NotFoundException('Localidad no encontrada');
    return l;
  }
  /** Una localidad es una comuna de Chile. Si ya existe se reutiliza (y se actualiza su descripción si se envía). */
  async crear(dto: CrearLocalidadDto) {
    const region = REGIONES.find((r) => r.nombre === dto.region);
    if (!region || !region.comunas.includes(dto.comuna))
      throw new BadRequestException('La comuna no pertenece a la región seleccionada');
    const existente = await this.localidades.findOne({ where: { region: dto.region, nombre: dto.comuna } });
    if (existente) {
      if (!dto.descripcion) return existente;
      existente.descripcion = dto.descripcion;
      return this.localidades.save(existente);
    }
    return this.localidades.save(
      this.localidades.create({
        region: dto.region, nombre: dto.comuna, descripcion: dto.descripcion, latitud: dto.latitud, longitud: dto.longitud,
      }),
    );
  }
  async agregarInformacion(localidadId: string, dto: CrearInformacionDto) {
    await this.obtener(localidadId);
    return this.info.save(this.info.create({ ...dto, localidadId }));
  }
  async agregarActividad(localidadId: string, dto: CrearActividadDto) {
    await this.obtener(localidadId);
    return this.actividades.save(this.actividades.create({ ...dto, localidadId }));
  }
  async agregarSector(localidadId: string, dto: CrearSectorDto) {
    await this.obtener(localidadId);
    return this.sectores.save(this.sectores.create({ ...dto, localidadId }));
  }
}
