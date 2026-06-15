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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { QueryInvoiceDto } from './dto/query-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar facturas del workspace' })
  @ApiResponse({ status: 200, description: 'Lista paginada de facturas' })
  findAll(
    @WorkspaceId() workspaceId: string,
    @Query() query: QueryInvoiceDto,
  ) {
    return this.invoicesService.findAll(workspaceId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una factura por ID' })
  @ApiResponse({ status: 200, description: 'Factura encontrada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  findOne(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findOne(workspaceId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva factura' })
  @ApiResponse({ status: 201, description: 'Factura creada' })
  create(
    @WorkspaceId() workspaceId: string,
    @CurrentUser() user: TokenPayload,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(workspaceId, user.userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una factura' })
  @ApiResponse({ status: 200, description: 'Factura actualizada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  update(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(workspaceId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar una factura (soft delete)' })
  @ApiResponse({ status: 204, description: 'Factura eliminada' })
  @ApiResponse({ status: 404, description: 'Factura no encontrada' })
  remove(
    @WorkspaceId() workspaceId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.remove(workspaceId, id);
  }
}
