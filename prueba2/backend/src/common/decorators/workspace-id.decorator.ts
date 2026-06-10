import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantRequest } from '../interceptors/workspace-tenant.interceptor';

export const WorkspaceId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<TenantRequest>();
    if (!request.workspaceId) {
      throw new Error(
        'workspaceId no encontrado en el request. ¿Falta el WorkspaceTenantInterceptor?',
      );
    }
    return request.workspaceId;
  },
);
