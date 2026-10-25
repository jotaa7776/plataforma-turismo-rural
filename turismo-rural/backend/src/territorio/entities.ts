import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum TipoCultural { TRADICION = 'tradicion', COSTUMBRE = 'costumbre', HISTORIA = 'historia' }

@Entity('localidades')
export class Localidad {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column() region: string;
  @Column({ type: 'text', nullable: true }) descripcion?: string;
  @Column({ type: 'float', nullable: true }) latitud?: number;
  @Column({ type: 'float', nullable: true }) longitud?: number;
  @OneToMany(() => InformacionCultural, (i) => i.localidad) informacion: InformacionCultural[];
  @OneToMany(() => ActividadTradicional, (a) => a.localidad) actividades: ActividadTradicional[];
  @OneToMany(() => Sector, (s) => s.localidad) sectores: Sector[];
}

@Entity('informacion_cultural')
export class InformacionCultural {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() titulo: string;
  @Column({ type: 'enum', enum: TipoCultural }) tipo: TipoCultural;
  @Column({ type: 'text' }) contenido: string;
  @Column() localidadId: string;
  @ManyToOne(() => Localidad, (l) => l.informacion, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'localidadId' }) localidad: Localidad;
}

@Entity('actividades_tradicionales')
export class ActividadTradicional {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ type: 'text' }) descripcion: string;
  @Column() localidadId: string;
  @ManyToOne(() => Localidad, (l) => l.actividades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'localidadId' }) localidad: Localidad;
}

@Entity('sectores')
export class Sector {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ type: 'text', nullable: true }) descripcion?: string;
  @Column() localidadId: string;
  @ManyToOne(() => Localidad, (l) => l.sectores, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'localidadId' }) localidad: Localidad;
}
