export type Rol = 'visitante' | 'emprendedor' | 'administrador';
export interface Usuario { id: string; nombre: string; correo: string; rol: Rol }
export interface Imagen { id: string; url: string; descripcion?: string }
export interface Region { nombre: string; comunas: string[] }
export interface Sector { id: string; nombre: string; descripcion?: string }
export interface Localidad {
  id: string; nombre: string; region: string; descripcion?: string;
  informacion?: { id: string; titulo: string; tipo: 'tradicion' | 'costumbre' | 'historia'; contenido: string }[];
  actividades?: { id: string; nombre: string; descripcion: string }[];
  sectores?: Sector[];
}
export interface Emprendimiento {
  id: string; nombre: string; descripcion: string; contacto: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  localidadId: string; sectorId?: string; localidad?: Localidad; sector?: Sector; propietario?: Usuario;
  imagenes?: Imagen[];
}
export type Dificultad = 'facil' | 'media' | 'dificil';
export interface Ruta {
  id: string; nombre: string; descripcion: string; dificultad: Dificultad; distanciaKm: number;
  duracionMin: number; recorrido: string; precio: number; emprendimientoId: string;
  emprendimiento?: Emprendimiento; imagenes?: Imagen[];
}
export interface Experiencia {
  id: string; nombre: string; descripcion: string; tipo: 'actividad' | 'servicio' | 'excursion';
  precio: number; capacidad: number; horarios?: string; emprendimientoId: string;
  emprendimiento?: Emprendimiento; ruta?: Ruta; imagenes?: Imagen[];
}
export interface Pago {
  id: string; estado: 'pagado' | 'rechazado' | 'reembolsado'; medioPago: string; monto: number; referencia: string;
}
export type EstadoReserva = 'pendiente' | 'aceptada' | 'rechazada' | 'cancelada';
export interface Reserva {
  id: string; fecha: string; hora: string; cantidadPersonas: number; estado: EstadoReserva; total: number;
  experiencia?: Experiencia; visitante?: Usuario; pago?: Pago | null;
}
