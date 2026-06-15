import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TokenPayload {
  userId: string;
  email: string;
  workspaceId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.user) {
      throw new Error(
        'Usuario no encontrado en el request. ¿Falta el AuthGuard?',
      );
    }
    return request.user as TokenPayload;
  },
);
