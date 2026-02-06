import { ROLES_KEY } from '@common/decorators';
import { SecurityLoggerService } from '@infrastructure/security';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private securityLogger: SecurityLoggerService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();

    const { user } = request;
    const ip = request.ip || request.connection?.remoteAddress || 'unknown';
    const userAgent = request.get('user-agent') || 'unknown';
    const endpoint = request.url;
    const method = request.method;

    if (!user || !requiredRoles.includes(user.role)) {
      this.securityLogger.logForbiddenAccess(
        user?.id || 'unknown',
        endpoint,
        method,
        ip,
        requiredRoles.join(', '),
        userAgent,
      );
      throw new ForbiddenException('Acesso negado: Permissão insuficiente.');
    }

    return true;
  }
}
