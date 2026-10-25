import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsuarioActual } from '../auth/auth.decorator';
import { EstadoEmprendimiento } from '../emprendimientos/emprendimiento.entity';
import { Experiencia } from '../oferta/entities';
import { EstadoPago, Pago } from '../pagos/pago.entity';
import { CrearReservaDto, DisponibilidadDto, ModificarReservaDto } from './dto/reserva.dto';
import { EstadoReserva, Reserva } from './reserva.entity';

const ACTIVAS = [EstadoReserva.PENDIENTE, EstadoReserva.ACEPTADA];
type Datos = { experienciaId: string; fecha: string; hora: string; cantidad: number };

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva) private reservas: Repository<Reserva>,
    @InjectRepository(Experiencia) private experiencias: Repository<Experiencia>,
    @InjectRepository(Pago) private pagos: Repository<Pago>,
  ) {}

  /** Agrega a cada reserva su pago (o null) para mostrarlo al visitante, emprendedor y administrador. */
  private async anexarPagos(rs: Reserva[]) {
    if (!rs.length) return rs;
    const pagos = await this.pagos.find({ where: { reservaId: In(rs.map((r) => r.id)) } });
    const porReserva = new Map(pagos.map((p) => [p.reservaId, p]));
    return rs.map((r) => Object.assign(r, { pago: porReserva.get(r.id) ?? null }));
  }

  /** Si la reserva estaba pagada y se cancela o rechaza, el pago simulado queda reembolsado. */
  private reembolsar(reservaId: string) {
    return this.pagos.update({ reservaId, estado: EstadoPago.PAGADO }, { estado: EstadoPago.REEMBOLSADO });
  }

  /** Personas ya comprometidas (reservas pendientes o aceptadas) en esa experiencia, fecha y hora. */
  private async cupoOcupado(experienciaId: string, fecha: string, hora: string, excluirId?: string) {
    const qb = this.reservas
      .createQueryBuilder('r')
      .select('COALESCE(SUM(r.cantidadPersonas), 0)', 'total')
      .where('r.experienciaId = :experienciaId', { experienciaId })
      .andWhere('r.fecha = :fecha', { fecha })
      .andWhere('r.hora = :hora', { hora })
      .andWhere('r.estado IN (:...estados)', { estados: ACTIVAS });
    if (excluirId) qb.andWhere('r.id != :excluirId', { excluirId });
    return Number((await qb.getRawOne()).total);
  }

  private async evaluar(d: Datos, excluirId?: string) {
    const experiencia = await this.experiencias.findOne({
      where: { id: d.experienciaId, emprendimiento: { estado: EstadoEmprendimiento.APROBADO } },
    });
    if (!experiencia) throw new NotFoundException('Experiencia no encontrada');
    const ocupado = await this.cupoOcupado(d.experienciaId, d.fecha, d.hora, excluirId);
    const cupoRestante = Math.max(experiencia.capacidad - ocupado, 0);
    return { experiencia, cupoRestante, disponible: cupoRestante >= d.cantidad };
  }

  async disponibilidad(q: DisponibilidadDto) {
    const { cupoRestante, disponible } = await this.evaluar({ ...q, cantidad: q.cantidad ?? 1 });
    return { disponible, cupoRestante };
  }

  /** Verifica fecha, cupo y que el visitante no tenga otra reserva a la misma hora (RF16, RF17). */
  private async validar(visitanteId: string, d: Datos, excluirId?: string) {
    if (d.fecha < new Date().toISOString().slice(0, 10)) throw new BadRequestException('La fecha no puede ser anterior a hoy');
    const { experiencia, disponible, cupoRestante } = await this.evaluar(d, excluirId);
    if (!disponible) throw new ConflictException(`No hay cupo suficiente. Quedan ${cupoRestante} lugares en ese horario`);
    const qb = this.reservas
      .createQueryBuilder('r')
      .where('r.visitanteId = :visitanteId', { visitanteId })
      .andWhere('r.fecha = :fecha', { fecha: d.fecha })
      .andWhere('r.hora = :hora', { hora: d.hora })
      .andWhere('r.estado IN (:...estados)', { estados: ACTIVAS });
    if (excluirId) qb.andWhere('r.id != :excluirId', { excluirId });
    if ((await qb.getCount()) > 0) throw new ConflictException('Ya tienes otra reserva en esa fecha y horario');
    return experiencia;
  }

  async crear(user: UsuarioActual, dto: CrearReservaDto) {
    const exp = await this.validar(user.id, { ...dto, cantidad: dto.cantidadPersonas });
    return this.reservas.save(
      this.reservas.create({
        visitanteId: user.id,
        experienciaId: dto.experienciaId,
        fecha: dto.fecha,
        hora: dto.hora,
        cantidadPersonas: dto.cantidadPersonas,
        total: exp.precio * dto.cantidadPersonas,
      }),
    );
  }

  private async propia(userId: string, id: string) {
    const r = await this.reservas.findOne({ where: { id } });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    if (r.visitanteId !== userId) throw new ForbiddenException('Esta reserva no es tuya');
    return r;
  }

  async modificar(user: UsuarioActual, id: string, dto: ModificarReservaDto) {
    const r = await this.propia(user.id, id);
    if (!ACTIVAS.includes(r.estado)) throw new BadRequestException('Esta reserva ya no se puede modificar');
    const pagada = await this.pagos.findOne({ where: { reservaId: r.id, estado: EstadoPago.PAGADO } });
    if (pagada && dto.cantidadPersonas !== undefined && dto.cantidadPersonas !== r.cantidadPersonas)
      throw new BadRequestException('Como ya pagaste, no puedes cambiar la cantidad de personas. Cancela y crea una nueva reserva');
    const datos = {
      experienciaId: r.experienciaId,
      fecha: dto.fecha ?? r.fecha,
      hora: dto.hora ?? r.hora,
      cantidad: dto.cantidadPersonas ?? r.cantidadPersonas,
    };
    const exp = await this.validar(user.id, datos, r.id);
    Object.assign(r, { fecha: datos.fecha, hora: datos.hora, cantidadPersonas: datos.cantidad });
    r.total = exp.precio * datos.cantidad;
    r.estado = EstadoReserva.PENDIENTE; // el emprendedor debe volver a confirmar
    return this.reservas.save(r);
  }

  async cancelar(user: UsuarioActual, id: string) {
    const r = await this.propia(user.id, id);
    if (!ACTIVAS.includes(r.estado)) throw new BadRequestException('Esta reserva ya no se puede cancelar');
    r.estado = EstadoReserva.CANCELADA;
    await this.reembolsar(r.id);
    return this.reservas.save(r);
  }

  mias(user: UsuarioActual) {
    return this.reservas
      .find({
        where: { visitanteId: user.id },
        relations: { experiencia: { emprendimiento: true } },
        order: { fecha: 'DESC' },
      })
      .then((rs) => this.anexarPagos(rs));
  }

  async obtenerMia(user: UsuarioActual, id: string) {
    const r = await this.reservas.findOne({ where: { id }, relations: { experiencia: { emprendimiento: true } } });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    if (r.visitanteId !== user.id) throw new ForbiddenException('Esta reserva no es tuya');
    return (await this.anexarPagos([r]))[0];
  }

  delEmprendedor(user: UsuarioActual) {
    return this.reservas
      .find({
        where: { experiencia: { emprendimiento: { propietarioId: user.id } } },
        relations: { experiencia: true, visitante: true },
        order: { fecha: 'ASC' },
      })
      .then((rs) => this.anexarPagos(rs));
  }

  async responder(user: UsuarioActual, id: string, estado: EstadoReserva.ACEPTADA | EstadoReserva.RECHAZADA) {
    const r = await this.reservas.findOne({ where: { id }, relations: { experiencia: { emprendimiento: true } } });
    if (!r) throw new NotFoundException('Reserva no encontrada');
    if (r.experiencia.emprendimiento.propietarioId !== user.id) throw new ForbiddenException('Esta reserva no es de tu emprendimiento');
    if (r.estado !== EstadoReserva.PENDIENTE) throw new BadRequestException('Solo se pueden responder reservas pendientes');
    r.estado = estado;
    if (estado === EstadoReserva.RECHAZADA) await this.reembolsar(r.id);
    return this.reservas.save(r);
  }

  // usada por administración
  listarTodas(estado?: EstadoReserva) {
    return this.reservas
      .find({
        where: estado ? { estado } : {},
        relations: { experiencia: { emprendimiento: true }, visitante: true },
        order: { fechaCreacion: 'DESC' },
        take: 200,
      })
      .then((rs) => this.anexarPagos(rs));
  }
}
