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
  UseGuards, 
  Put 
} from '@nestjs/common';
import { CaracteristicasService } from '../caracteristicas.service';
import { ActivarCaracteristicaDto, CreateCaracteristicaDto, DesactivarCaracteristicaDto, UpdateCaracteristicaDto } from '../dto/caracteristica.dto';
import { paginationCaracteristicaDTO } from '../dto/caracteristica-pagination.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
//import { JwtAuthGuard } from '@auth/guards/jwt.guard';



@ApiTags('caracteristicas')
@Controller('admin/catalogs/caracteristicas-catalogo')
//@UseGuards(JwtAuthGuard)

export class CaracteristicasController {
  constructor(private readonly caracteristicasService: CaracteristicasService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List all caracteristicas'})
  @Get()
  async findAll(@Param() paramsCartacteritica: paginationCaracteristicaDTO) {
    return this.caracteristicasService.findAll(paramsCartacteritica);
  }

  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({summary: 'Create caracteristica'})
  @Post()
  async create(@Body() data: CreateCaracteristicaDto, @Request() req: any) {
    const userId = req.user.id;
    //const userId = "57ff12f4-ab9e-453a-b75a-d45d55dad9e4"
    return await this.caracteristicasService.create(data, userId);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Busqueda de caracteristica' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.caracteristicasService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Actualizacion de caracteristica' })
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCaracteristicaDto, @Request() req: any) {
    return await this.caracteristicasService.update(id, updateDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar Caracteristica'})
  @Patch('/:id/activar')
  async activar(@Param('id') id: string, @Body() activarDto:ActivarCaracteristicaDto){
    return await this.caracteristicasService.activar(id, activarDto);
  } 
      
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar Caracteristica'})
  @Patch('/:id/desactivar')
  async desactivar(@Param('id') id: string, @Body() desactivarDto:DesactivarCaracteristicaDto){
    return await this.caracteristicasService.desactivar(id, desactivarDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a caracteristica' })
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.caracteristicasService.delete(id);
  }
}
