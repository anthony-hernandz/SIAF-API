import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SubclaseService } from './subclase.service';
import { CreateSubclaseDto } from './dto/create-subclase.dto';
import { UpdateSubclaseDto } from './dto/update-subclase.dto';
import { DesactivarSubclaseDto } from './dto/desactivar-subclase.dto';

@ApiTags('Catalogos - Subclase')
@ApiBearerAuth()
@Controller('administracion/catalogos/subclase')
export class SubclaseController {
  constructor(private readonly service: SubclaseService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Ping de subclase!' })
  ping() {
    return { ok: true, recurso: 'subclase' };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva subclase' })
  create(@Body() dto: CreateSubclaseDto) {
    return this.service.create(dto);
  }
  
  @Get()
  @ApiOperation({
    summary: 'Listar subclases (búsqueda, paginación y filtrado)',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Búsqueda por código/nombre (>=3)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Límite de resultados por página',
    example: 10,
  })
  @ApiQuery({
    name: 'claseId',
    required: false,
    description: 'ID de la clase para filtrar subclases',
  })
  @ApiQuery({
    name: 'grupoId',
    required: false,
    description: 'ID del grupo para filtrar subclases',
  })
  list(
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('claseId') claseId?: string,
    @Query('grupoId') grupoId?: string,
  ) {
    return this.service.search(
      q,
      Number(page),
      Number(limit),
      claseId,
      grupoId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una subclase por su ID' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una subclase por su ID' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateSubclaseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/activar')
  @ApiOperation({ summary: 'Activar una subclase por su ID' })
  activar(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.activar(id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar una subclase por su ID' })
  desactivar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: DesactivarSubclaseDto,
  ) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una subclase por su ID' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar subclases activas' })
  activos(
    @Query('claseId') claseId?: string,
    @Query('grupoId') grupoId?: string,
  ) {
    return this.service.activos(claseId, grupoId);
  }

}
