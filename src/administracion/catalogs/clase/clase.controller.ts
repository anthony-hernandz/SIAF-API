import {
  Controller,
  Get,
  Query,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ClaseService } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { DesactivarClaseDto } from './dto/desactivar-clase.dto';

@ApiTags('Catalogos - Clase')
@ApiBearerAuth()
@Controller('administracion/catalogos/clase')
export class ClaseController {
  constructor(private readonly service: ClaseService) {}

  @Get('ping')
  @ApiOperation({ summary: 'Verifica si el servicio está activo' })
  ping() {
    return { ok: true, recurso: 'clase' };
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva clase' })
  create(@Body() dto: CreateClaseDto) {
    return this.service.create(dto);
  }
  
  @Get()
  @ApiOperation({ summary: 'Listar clases (con búsqueda por nombre o código)' })
  @ApiQuery({
    name: 'q',
    required: false })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
  })
  @ApiQuery({
    name: 'grupoId',
    required: false,
  })
  list(
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('grupoId') grupoId?: string,
  ) {
    return this.service.search(q, page, Number(limit), grupoId);
  }

  @Get('activos')
  @ApiOperation({ summary: 'Listar clases activas' })
  activos(@Query('grupoId') grupoId?: string) {
    return this.service.activos(grupoId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una clase por ID' })
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una clase' })
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateClaseDto,
  ) {
    return this.service.update(id, dto);
  }

  @Patch(':id/activar')
  @ApiOperation({ summary: 'Activar una clase' })
  activar(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.activar(id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar una clase' })
  desactivar(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: DesactivarClaseDto,
  ) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una clase' })
  remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.remove(id);
  }

}
