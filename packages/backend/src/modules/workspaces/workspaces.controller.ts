import { Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WorkspaceId } from '../../common/decorators/workspace-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('Workspaces')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obtener el workspace del usuario autenticado' })
  getMyWorkspace(@WorkspaceId() workspaceId: string) {
    return this.workspacesService.findById(workspaceId);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizar el workspace del usuario autenticado' })
  updateMyWorkspace(
    @WorkspaceId() workspaceId: string,
    @Body() dto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(workspaceId, dto.name);
  }
}
