import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { numeric } from '../common/numeric.transformer';
import { Emprendimiento } from '../emprendimientos/emprendimiento.entity';

export enum TipoExperiencia { ACTIVIDAD = 'actividad', SERVICIO = 'servicio', EXCURSION = 'excursion' }
export enum Dificultad { FACIL = 'facil', MEDIA = 'media', DIFICIL = 'dificil' }

@Entity('rutas')
export class Ruta {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column({ type: 'enum', enum: Dificultad }) dificultad: Dificultad;
  @Column({ type: 'float' }) distanciaKm: number;
  @Column({ type: 'int' }) duracionMin: number;
  @Column({ type: 'text' }) recorrido: string;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, transformer: numeric }) precio: number;
  @Column() emprendimientoId: string;
  @ManyToOne(() => Emprendimiento, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'emprendimientoId' })
  emprendimiento: Emprendimiento;
  @OneToMany(() => Imagen, (i) => i.ruta) imagenes: Imagen[];
}

@Entity('experiencias')
export class Experiencia {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column({ type: 'enum', enum: TipoExperiencia }) tipo: TipoExperiencia;
  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: numeric }) precio: number;
  @Column({ type: 'int', default: 10 }) capacidad: number;
  @Column({ type: 'varchar', nullable: true }) horarios?: string;
  @Column() emprendimientoId: string;
  @ManyToOne(() => Emprendimiento, { onDelete: 'CASCADE' }) @JoinColumn({ name: 'emprendimientoId' })
  emprendimiento: Emprendimiento;
  @Column({ type: 'varchar', nullable: true }) rutaId?: string;
  @ManyToOne(() => Ruta, { nullable: true, onDelete: 'SET NULL' }) @JoinColumn({ name: 'rutaId' }) ruta?: Ruta;
  @OneToMany(() => Imagen, (i) => i.experiencia) imagenes: Imagen[];
}

@Entity('imagenes')
export class Imagen {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() url: string;
  @Column({ type: 'varchar', nullable: true }) descripcion?: string;
  @Column({ type: 'varchar', nullable: true }) experienciaId?: string;
  @ManyToOne(() => Experiencia, (e) => e.imagenes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'experienciaId' }) experiencia?: Experiencia;
  @Column({ type: 'varchar', nullable: true }) rutaId?: string;
  @ManyToOne(() => Ruta, (r) => r.imagenes, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rutaId' }) ruta?: Ruta;
  @Column({ type: 'varchar', nullable: true }) emprendimientoId?: string;
  @ManyToOne(() => Emprendimiento, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'emprendimientoId' }) emprendimiento?: Emprendimiento;
}
