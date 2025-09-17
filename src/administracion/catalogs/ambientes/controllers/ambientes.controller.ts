import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus,
  Request,
  Put
} from '@nestjs/common';
import { AmbientesService } from '../ambientes.service';
import { ActivarAmbienteDto, CreateAmbienteDto, DesactivarAmbienteDto, UpdateAmbienteDto } from '../dto/ambiente.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationAmbienteDTO } from '../dto/ambiente-pagination.dto';

@ApiTags('ambientes')
@Controller('admin/catalogs/ambientes-catalogo')
export class AmbientesController {
  constructor(private readonly ambientesService: AmbientesService) {}


  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List all Ambientes'})
  @Get()
  async findAll(@Param() paramsAmbiente: paginationAmbienteDTO) {
    return await this.ambientesService.findAll(paramsAmbiente);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Ambiente' })
  @Post()
  async create(@Body() data: CreateAmbienteDto, @Request() req: any) {
    const userId = "57ff12f4-ab9e-453a-b75a-d45d55dad9e4"
    return await this.ambientesService.create(data, userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar Ambientes' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.ambientesService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation ({ summary: 'Actualizacion Ambiente' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateAmbienteDto: UpdateAmbienteDto) {
    return await this.ambientesService.update(id, updateAmbienteDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar Ambiente'})
  @Patch('/:id/activar')
  async activar(@Param('id') id: string, @Body() activarDto:ActivarAmbienteDto){
    return await this.ambientesService.activar(id, activarDto);
  } 
    
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar Ambiente'})
  @Patch('/:id/desactivar')
  async desactivar(@Param('id') id: string, @Body() desactivarDto:DesactivarAmbienteDto){
    return await this.ambientesService.desactivar(id, desactivarDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Ambiente'})
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.ambientesService.delete(id);
  }
}
