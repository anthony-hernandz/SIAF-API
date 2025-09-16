import { 
  Controller, 
  Get, 
  Post, 
  Body,  
  Param, 
  Delete, 
  HttpCode,
  HttpStatus,
  Request,
  Put,
  Patch
} from '@nestjs/common';
import { TipoActivoService } from '../tipo_activos.service';
import { ActivarTipoActivoDto, CreateTipoActivoDto, DesactivarTipoActivoDto, UpdateTipoActivoDto } from '../dto/tipo_activo.dto';
import { paginationTipoAcDTO } from '../dto/tipoactivo-pagination.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
//import { JwtAuthGuard } from '@auth/guards/jwt.guard';

@ApiTags('tipoActivo')
@Controller('admin/catalogs/tipo-activo-catalogo')
//@UseGuards(JwtAuthGuard)
export class TipoActivoController {
  constructor(private readonly tipoActivoService: TipoActivoService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List all Tipo de activo'})
  @Get()
  async findAll(@Param() paramsTipoActivos: paginationTipoAcDTO) {
    return this.tipoActivoService.findAll(paramsTipoActivos);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create tipo de activo' })
  @Post()
  async create(@Body() data: CreateTipoActivoDto, @Request() req: any) {
    //const userId = req.user.id;
    const userId = "57ff12f4-ab9e-453a-b75a-d45d55dad9e4"
    return await this.tipoActivoService.create(data, userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar tipo de activo' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.tipoActivoService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation ({ summary: 'Actualizacion tipo de activo' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateTipoActivoDto: UpdateTipoActivoDto) {
    return await this.tipoActivoService.update(id, updateTipoActivoDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar el tipo de activo'})
  @Patch('/:id/activar')
  async activar(@Param('id') id: string, @Body() activarTipoActivoDto:ActivarTipoActivoDto){
    return await this.tipoActivoService.activar(id, activarTipoActivoDto);
  } 

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar el tipo de activo'})
  @Patch('/:id/desactivar')
  async desactivar(@Param('id') id: string, @Body() desactivarTipoActivoDto:DesactivarTipoActivoDto){
    return await this.tipoActivoService.desactivar(id, desactivarTipoActivoDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a tipo de activo'})
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.tipoActivoService.delete(id);
  }
}

