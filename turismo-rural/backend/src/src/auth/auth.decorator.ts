import {
  applyDecorators, CanActivate, createParamDecorator, ExecutionContext, Injectable, SetMetadata, UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Rol } from '../common/roles.enum';

export interface UsuarioActual { id: string; nombre: string; correo: string; rol: Rol }

const ROLES_KEY = 'roles';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Rol[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return roles.includes(user?.rol);
  }
}

/** @Auth() exige sesión; @Auth(Rol.X, Rol.Y) exige además uno de esos roles. */
export const Auth = (...roles: Rol[]) =>
  applyDecorators(SetMetadata(ROLES_KEY, roles), UseGuards(JwtAuthGuard, RolesGuard), ApiBearerAuth());

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): UsuarioActual => ctx.switchToHttp().getRequest().user,
);
