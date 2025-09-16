import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Request, 
  Delete, 
  HttpCode, 
  HttpStatus, 
  Put 
} from '@nestjs/common';
import { EstadoFisicoActivoService } from '../estado_fisico_activo.service';
import { ActivarEstadoFisicoActivoDto, CreateEstadoFisicoActivoDto, DesactivarEstadoFisicoActivoDto, UpdateEstadoFisicoActivoDto } from '../dto/estado_fisico_activo.dto';
import { paginationEstadoFisicoActivoDto } from '../dto/estado_fisico_activo-pagination.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('estado-fisico-activo')
@Controller('admin/catalogs/estado-fisico-activo-catalogo')
export class EstadoFisicoActivoController {
  constructor(private readonly estadoFisicoActivoService: EstadoFisicoActivoService) {}


  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List all Estados fisicos de activos'})
  @Get()
  async findAll(@Param() paramEstadoFisicoActivo: paginationEstadoFisicoActivoDto) {
    return this.estadoFisicoActivoService.findAll(paramEstadoFisicoActivo);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Estado Fisico de activo' })
  @Post()
  async create(@Body() data: CreateEstadoFisicoActivoDto, @Request() req: any) {
    //const userId = req.user.id;
    const userId = "57ff12f4-ab9e-453a-b75a-d45d55dad9e4"
    return await this.estadoFisicoActivoService.create(data, userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar Estado Fisico de Activo' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.estadoFisicoActivoService.findOne(id);
  }
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation ({ summary: 'Actualizacion Estado Fisico de Activo' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateEstadoFisicoActivoDto) {
    return this.estadoFisicoActivoService.update(id, updateDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar Estado Fisico de Activo'})
  @Patch('/:id/activar')
  async activar(@Param('id') id: string, @Body() activarDto:ActivarEstadoFisicoActivoDto){
    return await this.estadoFisicoActivoService.activar(id, activarDto);
  } 
    
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar Estado Fisico de Activo'})
  @Patch('/:id/desactivar')
  async desactivar(@Param('id') id: string, @Body() desactivarDto:DesactivarEstadoFisicoActivoDto){
    return await this.estadoFisicoActivoService.desactivar(id, desactivarDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Estado Fisico de Activo'})
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.estadoFisicoActivoService.delete(id);
  }
}
