import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Dificultad, TipoExperiencia } from '../entities';

export class CrearExperienciaDto {
  @IsString() @IsNotEmpty({ message: 'El nombre es obligatorio' }) nombre: string;
  @IsString() @IsNotEmpty({ message: 'La descripción es obligatoria' }) descripcion: string;
  @IsEnum(TipoExperiencia, { message: 'El tipo debe ser actividad, servicio o excursion' }) tipo: TipoExperiencia;
  @IsNumber({}, { message: 'El precio debe ser un número' }) @Min(0, { message: 'El precio no puede ser negativo' }) precio: number;
  @IsInt() @Min(1, { message: 'La capacidad debe ser al menos 1' }) capacidad: number;
  @IsOptional() @IsString() horarios?: string;
  @IsOptional() @IsUUID() rutaId?: string;
  @IsUUID() emprendimientoId: string;
}
export class ActualizarExperienciaDto extends PartialType(OmitType(CrearExperienciaDto, ['emprendimientoId'] as const)) {}

export class CrearRutaDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() descripcion: string;
  @IsEnum(Dificultad, { message: 'La dificultad debe ser facil, media o dificil' }) dificultad: Dificultad;
  @IsNumber() @Min(0) distanciaKm: number;
  @IsInt() @Min(1) duracionMin: number;
  @IsString() @IsNotEmpty() recorrido: string;
  @IsNumber() @Min(0, { message: 'El precio no puede ser negativo' }) precio: number;
  @IsUUID() emprendimientoId: string;
}
export class ActualizarRutaDto extends PartialType(OmitType(CrearRutaDto, ['emprendimientoId'] as const)) {}

export class FiltroOfertaDto {
  @IsOptional() @IsUUID() localidadId?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() comuna?: string;
  @IsOptional() @IsUUID() emprendimientoId?: string;
  @IsOptional() @IsEnum(TipoExperiencia) tipo?: TipoExperiencia;
}
export class SubirImagenDto {
  @IsOptional() @IsUUID() experienciaId?: string;
  @IsOptional() @IsUUID() rutaId?: string;
  @IsOptional() @IsUUID() emprendimientoId?: string;
  @IsOptional() @IsString() descripcion?: string;
}
