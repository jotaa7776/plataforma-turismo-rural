import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CrearEmprendimientoDto {
  @IsString() @IsNotEmpty({ message: 'El nombre del emprendimiento es obligatorio' }) nombre: string;
  @IsString() @IsNotEmpty({ message: 'La descripción es obligatoria' }) descripcion: string;
  @IsString() @IsNotEmpty({ message: 'Indica un medio de contacto' }) contacto: string;
  @IsUUID(undefined, { message: 'Selecciona una localidad' }) localidadId: string;
  @IsOptional() @IsUUID() sectorId?: string;
}
export class ActualizarEmprendimientoDto extends PartialType(CrearEmprendimientoDto) {}
