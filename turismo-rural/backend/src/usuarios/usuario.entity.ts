import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Rol } from '../common/roles.enum';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() nombre: string;
  @Column({ unique: true }) correo: string;
  @Column({ select: false }) password: string;
  @Column({ type: 'enum', enum: Rol, default: Rol.VISITANTE }) rol: Rol;
  @CreateDateColumn() fechaCreacion: Date;
}
