import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { DesactivarGrupoDto } from './dto/desactivar-grupo.dto';

@ApiTags('Catalogos - grupo')
@ApiBearerAuth()
@Controller('administracion/catalogos/grupo')
export class GrupoController {
  constructor(private readonly service: GrupoService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Verifica si el servicio está activo' })
  ping() {
    return { ok: true, recurso: 'grupo' };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo grupo' })
  create(@Body() dto: CreateGrupoDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar grupos (con búsqueda por nombre y paginación)',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Buscar por nombre',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Número de página',
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número de resultados por página',
    type: Number,
  })
  list(
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.search(q, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un grupo por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un grupo por ID' })
  update(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/activar')
  @ApiOperation({ summary: 'Activar un grupo por ID' })
  activar(@Param('id') id: string) {
    return this.service.activar(id);
  }

  @Post(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar un grupo por ID' })
  desactivar(@Param('id') id: string, @Body() dto: DesactivarGrupoDto) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Eliminar un grupo por ID, debe ser nuevo e inactivo',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
