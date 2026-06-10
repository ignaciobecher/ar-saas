import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

export interface TenantRequest extends Request {
  workspaceId?: string;
  user?: Record<string, unknown>;
}

@Injectable()
export class WorkspaceTenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<TenantRequest>();

    const headerWorkspaceId = request.headers['x-workspace-id'];
    if (headerWorkspaceId && typeof headerWorkspaceId === 'string') {
      request.workspaceId = headerWorkspaceId;
      return next.handle();
    }

    const workspaceIdFromUser =
      typeof request.user?.workspaceId === 'string'
        ? request.user.workspaceId
        : undefined;
    if (workspaceIdFromUser) {
      request.workspaceId = workspaceIdFromUser;
      return next.handle();
    }

    const apiPrefix = process.env.API_PREFIX ?? 'api';
    if (request.path.startsWith(`/${apiPrefix}/auth/`)) {
      return next.handle();
    }

    throw new BadRequestException(
      'Se requiere workspaceId en header x-workspace-id o token JWT',
    );
  }
}
