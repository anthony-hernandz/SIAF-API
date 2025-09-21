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
import { ProcedenciaService } from '../procedencia.service';
import { ActivarProcedenciaDto, CreateProcedenciaDto, DesactivarProcedenciaDto, UpdateProcedenciaDto } from '../dto/procedencia.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationProcedenciaDTO } from '../dto/procedencia-pagination.dto';
//import { JwtAuthGuard } from '@auth/guards/jwt.guard';

@ApiTags('procedencia')
@Controller('admin/catalogs/procedencia-catalogo')
// @UseGuards(JwtAuthGuard)
export class ProcedenciaController {
  constructor(private readonly procedenciaService: ProcedenciaService) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List all Procedencia'})
  @Get()
  async findAll( @Param() paramsProcedencia: paginationProcedenciaDTO) {
    return this.procedenciaService.findAll(paramsProcedencia);
  }
  
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create Procedencia' })
  @Post()
  async create(@Body() data: CreateProcedenciaDto, @Request() req: any) {
    //const userId = req.user.id;
    const userId = "57ff12f4-ab9e-453a-b75a-d45d55dad9e4"
    return await this.procedenciaService.create(data, userId);
    }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar procedencias' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.procedenciaService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation ({ summary: 'Actualizacion procedencia' })
  @Put('/:id')
  async update(@Param('id') id: string, @Body() updateProcedenciaDto: UpdateProcedenciaDto) {
    return await this.procedenciaService.update(id, updateProcedenciaDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activar Prcedencia'})
  @Patch('/:id/activar')
  async activar(@Param('id') id: string, @Body() activarProcedenciaDto:ActivarProcedenciaDto){
    return await this.procedenciaService.activar(id, activarProcedenciaDto);
  } 
  
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Desactivar Procedencia'})
  @Patch('/:id/desactivar')
  async desactivar(@Param('id') id: string, @Body() desactivarProcedenciaDto:DesactivarProcedenciaDto){
    return await this.procedenciaService.desactivar(id, desactivarProcedenciaDto);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete Procedencia'})
  @Delete('/:id')
   async delete(@Param('id') id: string) {
    return await this.procedenciaService.delete(id);
  }
}
