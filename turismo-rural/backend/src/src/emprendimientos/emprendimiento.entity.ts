import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Localidad, Sector } from '../territorio/entities';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoEmprendimiento { PENDIENTE = 'pendiente', APROBADO = 'aprobado', RECHAZADO = 'rechazado' }

@Entity('emprendimientos')
export class Emprendimiento {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column() contacto: string;
  @Column({ type: 'enum', enum: EstadoEmprendimiento, default: EstadoEmprendimiento.PENDIENTE })
  estado: EstadoEmprendimiento;
  @CreateDateColumn() fechaCreacion: Date;

  @Column() localidadId: string;
  @ManyToOne(() => Localidad) @JoinColumn({ name: 'localidadId' }) localidad: Localidad;

  @Column({ nullable: true }) sectorId?: string;
  @ManyToOne(() => Sector, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'sectorId' }) sector?: Sector;

  @Column() propietarioId: string;
  @ManyToOne(() => Usuario) @JoinColumn({ name: 'propietarioId' }) propietario: Usuario;
}
