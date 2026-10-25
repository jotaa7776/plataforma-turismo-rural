import { OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Matches, Min } from 'class-validator';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CrearReservaDto {
  @IsUUID() experienciaId: string;
  /** Fecha de la actividad, o fecha de entrada en un alojamiento. */
  @Matches(FECHA, { message: 'La fecha debe tener formato AAAA-MM-DD' }) fecha: string;
  /** Obligatoria salvo en alojamientos. */
  @IsOptional() @Matches(HORA, { message: 'La hora debe tener formato HH:mm' }) hora?: string;
  /** Solo alojamientos: fecha de salida (las noches se cuentan entre entrada y salida). */
  @IsOptional() @Matches(FECHA, { message: 'La fecha de salida debe tener formato AAAA-MM-DD' }) fechaSalida?: string;
  @IsInt() @Min(1, { message: 'Debe ir al menos una persona' }) cantidadPersonas: number;
}
export class ModificarReservaDto extends PartialType(OmitType(CrearReservaDto, ['experienciaId'] as const)) {}

export class DisponibilidadDto {
  @IsUUID() experienciaId: string;
  @Matches(FECHA) fecha: string;
  @IsOptional() @Matches(HORA) hora?: string;
  @IsOptional() @Matches(FECHA) fechaSalida?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) cantidad?: number;
}
