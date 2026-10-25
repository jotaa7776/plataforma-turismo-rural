import { Injectable } from '@nestjs/common';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { EmprendimientosService } from '../emprendimientos/emprendimientos.service';
import { Emprendimiento, EstadoEmprendimiento } from '../emprendimientos/emprendimiento.entity';
import { Experiencia, Imagen, Ruta } from '../oferta/entities';
import { UPLOADS } from '../oferta/oferta.service';
import { EstadoReserva, Reserva } from '../reservas/reserva.entity';
import { ReservasService } from '../reservas/reservas.service';
import { Usuario } from '../usuarios/usuario.entity';

@Injectable()
export class AdministracionService {
  constructor(
    private emprendimientos: EmprendimientosService,
    private reservas: ReservasService,
    private ds: DataSource,
  ) {}

  listarEmprendimientos(estado?: EstadoEmprendimiento) { return this.emprendimientos.listarPorEstado(estado); }
  cambiarEstado(id: string, estado: EstadoEmprendimiento) { return this.emprendimientos.cambiarEstado(id, estado); }
  listarReservas(estado?: EstadoReserva) { return this.reservas.listarTodas(estado); }

  private async porEstado(entidad: typeof Emprendimiento | typeof Reserva) {
    const filas = await this.ds.getRepository(entidad as any).createQueryBuilder('x')
      .select('x.estado', 'estado').addSelect('COUNT(*)', 'total').groupBy('x.estado').getRawMany();
    return Object.fromEntries(filas.map((f) => [f.estado, Number(f.total)]));
  }

  private async bytesImagenes() {
    try {
      const archivos = await readdir(UPLOADS);
      const pesos = await Promise.all(archivos.map(async (a) => (await stat(join(UPLOADS, a))).size));
      return pesos.reduce((a, b) => a + b, 0);
    } catch {
      return 0;
    }
  }

  /** Indicadores básicos de uso y consumo para decisiones de mantenimiento (E5-HU04). */
  async indicadores() {
    const cuenta = (e: any) => this.ds.getRepository(e).count();
    const [usuarios, experiencias, rutas, imagenes, emprendimientos, reservas, bytes] = await Promise.all([
      cuenta(Usuario), cuenta(Experiencia), cuenta(Ruta), cuenta(Imagen),
      this.porEstado(Emprendimiento), this.porEstado(Reserva), this.bytesImagenes(),
    ]);
    return {
      usuarios, experiencias, rutas, imagenes, emprendimientos, reservas,
      almacenamientoImagenesMB: Math.round((bytes / 1024 / 1024) * 100) / 100,
    };
  }
}
