import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { numeric } from '../common/numeric.transformer';
import { Experiencia } from '../oferta/entities';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoReserva { PENDIENTE = 'pendiente', ACEPTADA = 'aceptada', RECHAZADA = 'rechazada', CANCELADA = 'cancelada' }

@Entity('reservas')
export class Reserva {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'date' }) fecha: string; // YYYY-MM-DD
  @Column({ type: 'varchar', length: 5 }) hora: string; // HH:mm
  @Column({ type: 'date', nullable: true }) fechaSalida?: string | null; // solo alojamientos
  @Column({ type: 'int', nullable: true }) noches?: number | null; // solo alojamientos
  @Column({ type: 'int' }) cantidadPersonas: number;
  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE }) estado: EstadoReserva;
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: numeric }) total: number;
  @CreateDateColumn() fechaCreacion: Date;

  @Column() visitanteId: string;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'visitanteId' }) visitante: Usuario;
  @Column() experienciaId: string;
  @ManyToOne(() => Experiencia, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'experienciaId' }) experiencia: Experiencia;
}
