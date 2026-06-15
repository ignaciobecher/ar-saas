import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
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
    const apiPrefix = process.env.API_PREFIX ?? 'api';

    if (request.path.startsWith(`/${apiPrefix}/auth/`)) {
      return next.handle();
    }

    return next.handle();
  }
}
