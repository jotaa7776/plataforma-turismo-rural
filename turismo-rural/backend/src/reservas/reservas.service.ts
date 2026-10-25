import {
  BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UsuarioActual } from '../auth/auth.decorator';
import { EstadoEmprendimiento } from '../emprendimientos/emprendimiento.entity';
import { Experiencia, TipoExperiencia } from '../oferta/entities';
import { EstadoPago, Pago } from '../pagos/pago.entity';
import { CrearReservaDto, DisponibilidadDto, ModificarReservaDto } from './dto/reserva.dto';
import { EstadoReserva, Reserva } from './reserva.entity';

const ACTIVAS = [EstadoReserva.PENDIENTE, EstadoReserva.ACEPTADA];
const HORA_ENTRADA = '15:00'; // hora de llegada que se registra en los alojamientos
const MAX_NOCHES = 30;
type Datos = { experienciaId: string; fecha: string; hora?: string; fechaSalida?: string; cantidad: number };

const dia = (s: string) => Date.parse(`${s}T00:00:00Z`);
const nochesEntre = (a: string, b: string) => Math.round((dia(b) - dia(a)) / 86400000);
const sumarDias = (s: string, n: number) => new Date(dia(s) + n * 86400000).toISOString().slice(0, 10);

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

  /** Personas ya comprometidas en una actividad, fecha y hora. */
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

  /** Alojamientos: máximo de personas alojadas en cualquiera de las noches pedidas (entrada incluida, salida excluida). */
  private async maximoOcupado(experienciaId: string, entrada: string, salida: string, excluirId?: string) {
    const qb = this.reservas
      .createQueryBuilder('r')
      .where('r.experienciaId = :experienciaId', { experienciaId })
      .andWhere('r.estado IN (:...estados)', { estados: ACTIVAS })
      .andWhere('r.fecha < :salida', { salida })
      .andWhere('r.fechaSalida > :entrada', { entrada });
    if (excluirId) qb.andWhere('r.id != :excluirId', { excluirId });
    const solapadas = await qb.getMany();
    let maximo = 0;
    for (let noche = entrada; noche < salida; noche = sumarDias(noche, 1)) {
      const personas = solapadas
        .filter((x) => x.fecha <= noche && noche < x.fechaSalida)
        .reduce((suma, x) => suma + x.cantidadPersonas, 0);
      maximo = Math.max(maximo, personas);
    }
    return maximo;
  }

  /** Alojamiento: exige salida y calcula noches. Resto de la oferta: exige hora. */
  private normalizar(exp: Experiencia, d: Datos) {
    if (exp.tipo === TipoExperiencia.ALOJAMIENTO) {
      if (!d.fechaSalida) throw new BadRequestException('Indica la fecha de salida');
      const noches = nochesEntre(d.fecha, d.fechaSalida);
      if (noches < 1) throw new BadRequestException('La fecha de salida debe ser posterior a la de entrada');
      if (noches > MAX_NOCHES) throw new BadRequestException(`Puedes reservar hasta ${MAX_NOCHES} noches seguidas`);
      return { fecha: d.fecha, hora: d.hora || HORA_ENTRADA, fechaSalida: d.fechaSalida, noches };
    }
    if (!d.hora) throw new BadRequestException('Indica la hora');
    return { fecha: d.fecha, hora: d.hora, fechaSalida: null as string | null, noches: null as number | null };
  }

  private async evaluar(d: Datos, excluirId?: string) {
    const experiencia = await this.experiencias.findOne({
      where: { id: d.experienciaId, emprendimiento: { estado: EstadoEmprendimiento.APROBADO } },
    });
    if (!experiencia) throw new NotFoundException('Experiencia no encontrada');
    const n = this.normalizar(experiencia, d);
    const ocupado = n.fechaSalida
      ? await this.maximoOcupado(d.experienciaId, n.fecha, n.fechaSalida, excluirId)
      : await this.cupoOcupado(d.experienciaId, n.fecha, n.hora, excluirId);
    const cupoRestante = Math.max(experiencia.capacidad - ocupado, 0);
    return { experiencia, ...n, cupoRestante, disponible: cupoRestante >= d.cantidad };
  }

  async disponibilidad(q: DisponibilidadDto) {
    const { cupoRestante, disponible, noches } = await this.evaluar({ ...q, cantidad: q.cantidad ?? 1 });
    return { disponible, cupoRestante, noches };
  }

  /** Verifica fecha, cupo y que el visitante no tenga otra reserva que choque (RF16, RF17). */
  private async validar(visitanteId: string, d: Datos, excluirId?: string) {
    if (d.fecha < new Date().toISOString().slice(0, 10)) throw new BadRequestException('La fecha no puede ser anterior a hoy');
    const ev = await this.evaluar(d, excluirId);
    const aloj = !!ev.fechaSalida;
    if (!ev.disponible)
      throw new ConflictException(
        aloj
          ? `No hay cupo para todas esas noches. En esas fechas quedan como máximo ${ev.cupoRestante} lugares`
          : `No hay cupo suficiente. Quedan ${ev.cupoRestante} lugares en ese horario`,
      );

    const qb = this.reservas
      .createQueryBuilder('r')
      .where('r.visitanteId = :visitanteId', { visitanteId })
      .andWhere('r.estado IN (:...estados)', { estados: ACTIVAS });
    if (aloj) {
      qb.andWhere('r.fechaSalida IS NOT NULL')
        .andWhere('r.fecha < :salida', { salida: ev.fechaSalida })
        .andWhere('r.fechaSalida > :entrada', { entrada: ev.fecha });
    } else {
      qb.andWhere('r.fecha = :fecha', { fecha: ev.fecha }).andWhere('r.hora = :hora', { hora: ev.hora });
    }
    if (excluirId) qb.andWhere('r.id != :excluirId', { excluirId });
    if ((await qb.getCount()) > 0)
      throw new ConflictException(aloj ? 'Ya tienes otro alojamiento reservado en esas fechas' : 'Ya tienes otra reserva en esa fecha y horario');
    return ev;
  }

  async crear(user: UsuarioActual, dto: CrearReservaDto) {
    const ev = await this.validar(user.id, { ...dto, cantidad: dto.cantidadPersonas });
    return this.reservas.save(
      this.reservas.create({
        visitanteId: user.id,
        experienciaId: dto.experienciaId,
        fecha: ev.fecha,
        hora: ev.hora,
        fechaSalida: ev.fechaSalida,
        noches: ev.noches,
        cantidadPersonas: dto.cantidadPersonas,
        total: ev.experiencia.precio * dto.cantidadPersonas * (ev.noches ?? 1),
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
    const datos: Datos = {
      experienciaId: r.experienciaId,
      fecha: dto.fecha ?? r.fecha,
      hora: dto.hora ?? r.hora,
      fechaSalida: dto.fechaSalida ?? r.fechaSalida ?? undefined,
      cantidad: dto.cantidadPersonas ?? r.cantidadPersonas,
    };
    const ev = await this.validar(user.id, datos, r.id);

    const pagada = await this.pagos.findOne({ where: { reservaId: r.id, estado: EstadoPago.PAGADO } });
    if (pagada && (datos.cantidad !== r.cantidadPersonas || (ev.noches ?? 1) !== (r.noches ?? 1)))
      throw new BadRequestException('Como ya pagaste, no puedes cambiar la cantidad de personas ni de noches. Cancela y crea una nueva reserva');

    Object.assign(r, { fecha: ev.fecha, hora: ev.hora, fechaSalida: ev.fechaSalida, noches: ev.noches, cantidadPersonas: datos.cantidad });
    r.total = ev.experiencia.precio * datos.cantidad * (ev.noches ?? 1);
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
