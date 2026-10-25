import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { numeric } from '../common/numeric.transformer';
import { Reserva } from '../reservas/reserva.entity';

export enum MedioPago { TARJETA = 'tarjeta', TRANSFERENCIA = 'transferencia', BILLETERA = 'billetera', EFECTIVO = 'efectivo' }
export enum EstadoPago { PAGADO = 'pagado', RECHAZADO = 'rechazado', REEMBOLSADO = 'reembolsado' }

@Entity('pagos')
export class Pago {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) reservaId: string;
  @OneToOne(() => Reserva, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'reservaId' }) reserva: Reserva;
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: numeric }) monto: number;
  @Column({ type: 'enum', enum: MedioPago }) medioPago: MedioPago;
  @Column({ type: 'enum', enum: EstadoPago }) estado: EstadoPago;
  @Column() referencia: string;
  @CreateDateColumn() fecha: Date;
}
