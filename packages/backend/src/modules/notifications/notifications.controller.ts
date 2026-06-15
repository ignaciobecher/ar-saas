import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { TokenPayload } from '../../common/decorators/current-user.decorator';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario' })
  @ApiResponse({ status: 200, description: 'Lista paginada de notificaciones' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Query() query: QueryNotificationDto,
  ) {
    return this.notificationsService.findAll(workspaceId, user.userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  @ApiResponse({ status: 200, description: '{ count: number }' })
  getUnreadCount(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.notificationsService.getUnreadCount(workspaceId, user.userId);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Todas marcadas como leídas' })
  markAllAsRead(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
  ) {
    return this.notificationsService.markAllAsRead(workspaceId, user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una notificación por ID' })
  @ApiResponse({ status: 200, description: 'Notificación encontrada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una notificación' })
  @ApiResponse({ status: 201, description: 'Notificación creada' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  markAsRead(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(workspaceId, id);
  }

  @Patch(':id/unread')
  @ApiOperation({ summary: 'Marcar notificación como no leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como no leída' })
  markAsUnread(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsUnread(workspaceId, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una notificación (soft delete)' })
  @ApiResponse({ status: 204, description: 'Notificación eliminada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.remove(workspaceId, id);
  }
}
