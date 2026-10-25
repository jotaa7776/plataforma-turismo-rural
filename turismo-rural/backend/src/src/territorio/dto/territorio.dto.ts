import { IsEnum, IsLatitude, IsLongitude, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TipoCultural } from '../entities';

export class CrearLocalidadDto {
  @IsString() @IsNotEmpty({ message: 'Selecciona una región' }) region: string;
  @IsString() @IsNotEmpty({ message: 'Selecciona una comuna' }) comuna: string;
  @IsOptional() @IsString() descripcion?: string;
  @IsOptional() @IsLatitude() latitud?: number;
  @IsOptional() @IsLongitude() longitud?: number;
}
export class FiltroLocalidadDto {
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() comuna?: string;
}
export class CrearInformacionDto {
  @IsString() @IsNotEmpty() titulo: string;
  @IsEnum(TipoCultural, { message: 'El tipo debe ser tradicion, costumbre o historia' }) tipo: TipoCultural;
  @IsString() @IsNotEmpty() contenido: string;
}
export class CrearActividadDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() descripcion: string;
}
export class CrearSectorDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsOptional() @IsString() descripcion?: string;
}
