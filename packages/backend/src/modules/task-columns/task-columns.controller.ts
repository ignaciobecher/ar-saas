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
import { CreateTaskColumnDto } from './dto/create-task-column.dto';
import { ReorderColumnsDto } from './dto/reorder-columns.dto';
import { UpdateTaskColumnDto } from './dto/update-task-column.dto';
import { TaskColumnsService } from './task-columns.service';

@ApiTags('Task Columns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('task-columns')
export class TaskColumnsController {
  constructor(private readonly taskColumnsService: TaskColumnsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar columnas del workspace' })
  @ApiResponse({ status: 200, description: 'Lista de columnas ordenadas' })
  findAll(@WorkspaceId() workspaceId: string) {
    return this.taskColumnsService.findAll(workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva columna' })
  @ApiResponse({ status: 201, description: 'Columna creada' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateTaskColumnDto,
  ) {
    return this.taskColumnsService.create(workspaceId, user.userId, dto);
  }

  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar columnas' })
  @ApiResponse({ status: 200, description: 'Columnas reordenadas' })
  reorder(
    @WorkspaceId() workspaceId: string,
    @Body() dto: ReorderColumnsDto,
  ) {
    return this.taskColumnsService.reorder(workspaceId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una columna' })
  @ApiResponse({ status: 200, description: 'Columna actualizada' })
  @ApiResponse({ status: 404, description: 'Columna no encontrada' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskColumnDto,
  ) {
    return this.taskColumnsService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una columna (soft delete)' })
  @ApiResponse({ status: 204, description: 'Columna eliminada' })
  @ApiResponse({ status: 404, description: 'Columna no encontrada' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.taskColumnsService.remove(workspaceId, id);
  }
}
