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
import { CreateDealDto } from './dto/create-deal.dto';
import { QueryDealDto } from './dto/query-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { PipelineService } from './pipeline.service';

@ApiTags('Pipeline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(private readonly pipelineService: PipelineService) {}

  @Get()
  @ApiOperation({ summary: 'Listar deals del workspace' })
  @ApiResponse({ status: 200, description: 'Lista paginada de deals' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryDealDto,
  ) {
    return this.pipelineService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un deal por ID' })
  @ApiResponse({ status: 200, description: 'Deal encontrado' })
  @ApiResponse({ status: 404, description: 'Deal no encontrado' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.pipelineService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo deal' })
  @ApiResponse({ status: 201, description: 'Deal creado' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateDealDto,
  ) {
    return this.pipelineService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un deal' })
  @ApiResponse({ status: 200, description: 'Deal actualizado' })
  @ApiResponse({ status: 404, description: 'Deal no encontrado' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateDealDto,
  ) {
    return this.pipelineService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un deal (soft delete)' })
  @ApiResponse({ status: 204, description: 'Deal eliminado' })
  @ApiResponse({ status: 404, description: 'Deal no encontrado' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.pipelineService.remove(workspaceId, id);
  }
}
