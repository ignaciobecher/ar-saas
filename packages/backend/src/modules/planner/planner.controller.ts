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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { TokenPayload } from '../../common/decorators/current-user.decorator';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePlannerBlockDto } from './dto/create-planner-block.dto';
import { QueryPlannerBlockDto } from './dto/query-planner-block.dto';
import { UpdateBlockStatusDto } from './dto/update-block-status.dto';
import { UpdatePlannerBlockDto } from './dto/update-planner-block.dto';
import { PlannerService } from './planner.service';

@ApiTags('Planner Blocks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('planner-blocks')
export class PlannerController {
  constructor(private readonly plannerService: PlannerService) {}

  @Get()
  @ApiOperation({ summary: 'Listar bloques del planner (por fecha, rango, estado)' })
  @ApiResponse({ status: 200, description: 'Lista de bloques' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Query() query: QueryPlannerBlockDto,
  ) {
    return this.plannerService.findAll(workspaceId, user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un bloque por ID' })
  @ApiResponse({ status: 200, description: 'Bloque encontrado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ) {
    return this.plannerService.findOne(workspaceId, user.userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo bloque' })
  @ApiResponse({ status: 201, description: 'Bloque creado' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreatePlannerBlockDto,
  ) {
    return this.plannerService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un bloque' })
  @ApiResponse({ status: 200, description: 'Bloque actualizado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  update(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePlannerBlockDto,
  ) {
    return this.plannerService.update(workspaceId, user.userId, id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar solo el estado de un bloque' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  updateStatus(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBlockStatusDto,
  ) {
    return this.plannerService.updateStatus(workspaceId, user.userId, id, dto);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar un bloque (opcionalmente en otra fecha)' })
  @ApiQuery({ name: 'targetDate', required: false, example: '2026-06-16' })
  @ApiResponse({ status: 201, description: 'Bloque duplicado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  duplicate(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
    @Query('targetDate') targetDate?: string,
  ) {
    return this.plannerService.duplicate(workspaceId, user.userId, id, targetDate);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un bloque (soft delete)' })
  @ApiResponse({ status: 204, description: 'Bloque eliminado' })
  @ApiResponse({ status: 404, description: 'Bloque no encontrado' })
  remove(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Param('id') id: string,
  ) {
    return this.plannerService.remove(workspaceId, user.userId, id);
  }
}
