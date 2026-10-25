import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../common/roles.enum';

export class RegistroDto {
  @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' }) nombre: string;
  @IsEmail({}, { message: 'Ingresa un correo válido' }) correo: string;
  @IsString() @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' }) password: string;
  @IsIn([Rol.VISITANTE, Rol.EMPRENDEDOR], { message: 'El rol debe ser visitante o emprendedor' }) rol: Rol;
}
export class LoginDto {
  @IsEmail({}, { message: 'Ingresa un correo válido' }) correo: string;
  @IsString() @IsNotEmpty() password: string;
}
