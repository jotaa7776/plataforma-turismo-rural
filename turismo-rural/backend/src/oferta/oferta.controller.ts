import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Auth, CurrentUser, UsuarioActual } from '../auth/auth.decorator';
import { Rol } from '../common/roles.enum';
import {
  ActualizarExperienciaDto, ActualizarRutaDto, CrearExperienciaDto, CrearRutaDto, FiltroOfertaDto, SubirImagenDto,
} from './dto/oferta.dto';
import { OfertaService } from './oferta.service';

@ApiTags('oferta turística')
@Controller()
export class OfertaController {
  constructor(private s: OfertaService) {}

  // experiencias
  @Get('experiencias') listarExp(@Query() f: FiltroOfertaDto) { return this.s.listarExperiencias(f); }
  @Get('experiencias/mias') @Auth(Rol.EMPRENDEDOR) misExp(@CurrentUser() u: UsuarioActual) { return this.s.misExperiencias(u); }
  @Get('experiencias/:id') obtenerExp(@Param('id', ParseUUIDPipe) id: string) { return this.s.obtenerExperiencia(id); }
  @Post('experiencias') @Auth(Rol.EMPRENDEDOR)
  crearExp(@CurrentUser() u: UsuarioActual, @Body() dto: CrearExperienciaDto) { return this.s.crearExperiencia(u, dto); }
  @Patch('experiencias/:id') @Auth(Rol.EMPRENDEDOR)
  actualizarExp(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarExperienciaDto) {
    return this.s.actualizarExperiencia(u, id, dto);
  }

  // rutas
  @Get('rutas') listarRutas(@Query() f: FiltroOfertaDto) { return this.s.listarRutas(f); }
  @Get('rutas/mias') @Auth(Rol.EMPRENDEDOR) misRutas(@CurrentUser() u: UsuarioActual) { return this.s.misRutas(u); }
  @Get('rutas/:id') obtenerRuta(@Param('id', ParseUUIDPipe) id: string) { return this.s.obtenerRuta(id); }
  @Post('rutas') @Auth(Rol.EMPRENDEDOR)
  crearRuta(@CurrentUser() u: UsuarioActual, @Body() dto: CrearRutaDto) { return this.s.crearRuta(u, dto); }
  @Patch('rutas/:id') @Auth(Rol.EMPRENDEDOR)
  actualizarRuta(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarRutaDto) {
    return this.s.actualizarRuta(u, id, dto);
  }

  // imágenes
  @Post('imagenes') @Auth(Rol.EMPRENDEDOR) @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp)$/.test(file.mimetype)),
    }),
  )
  subir(@CurrentUser() u: UsuarioActual, @UploadedFile() archivo: Express.Multer.File, @Body() dto: SubirImagenDto) {
    return this.s.subirImagen(u, archivo, dto);
  }

  @Delete('imagenes/:id') @Auth(Rol.EMPRENDEDOR)
  eliminarImagen(@CurrentUser() u: UsuarioActual, @Param('id', ParseUUIDPipe) id: string) { return this.s.eliminarImagen(u, id); }
}
