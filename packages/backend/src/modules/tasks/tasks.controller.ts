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
import { CreateTaskDto } from './dto/create-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Listar tareas del workspace' })
  @ApiResponse({ status: 200, description: 'Lista paginada de tareas' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryTaskDto,
  ) {
    return this.tasksService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una tarea por ID' })
  @ApiResponse({ status: 200, description: 'Tarea encontrada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva tarea' })
  @ApiResponse({ status: 201, description: 'Tarea creada' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una tarea' })
  @ApiResponse({ status: 200, description: 'Tarea actualizada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(workspaceId, id, dto);
  }

  @Patch(':id/move')
  @ApiOperation({ summary: 'Mover una tarea a otra columna' })
  @ApiResponse({ status: 200, description: 'Tarea movida' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  move(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: MoveTaskDto,
  ) {
    return this.tasksService.move(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una tarea (soft delete)' })
  @ApiResponse({ status: 204, description: 'Tarea eliminada' })
  @ApiResponse({ status: 404, description: 'Tarea no encontrada' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.tasksService.remove(workspaceId, id);
  }
}
