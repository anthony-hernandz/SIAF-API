import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TipofinanciamientoService } from './tipofinanciamiento.service';
import { CreateTipofinanciamientoDto } from './dto/create-tipofinanciamiento.dto';
import { UpdateTipofinanciamientoDto } from './dto/update-tipofinanciamiento.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Catalogos - tipofinanciamiento')
@ApiBearerAuth()
@Controller('administracion/catalogos/tipofinanciamiento')
export class TipofinanciamientoController {
  constructor(
    private readonly tipofinanciamientoService: TipofinanciamientoService,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: 'Verifica si el servicio está activo' })
  ping() {
    return { ok: true, recurso: 'tipofinanciamiento' };
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo tipo de financiamiento' })
  create(@Body() dto: CreateTipofinanciamientoDto) {
    return this.tipofinanciamientoService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar tipos de financiamiento (con búsqueda por nombre)',
  })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Filtro por nombre (tipo de financiamiento)',
  })
  findAll(@Query('q') q?: string) {
    return this.tipofinanciamientoService.findAll(q);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un tipo de financiamiento por ID' })
  findOne(@Param('id') id: string) {
    return this.tipofinanciamientoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un tipo de financiamiento' })
  update(@Param('id') id: string, @Body() dto: UpdateTipofinanciamientoDto) {
    return this.tipofinanciamientoService.update(id, dto);
  }

  @Patch(':id/activar')
  @ApiOperation({ summary: 'Activar un tipo de financiamiento' })
  activar(@Param('id') id: string) {
    return this.tipofinanciamientoService.activar(id);
  }

  @Patch(':id/desactivar')
  @ApiOperation({ summary: 'Desactivar un tipo de financiamiento' })
  desactivar(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.tipofinanciamientoService.desactivar(id, motivo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un tipo de financiamiento' })
  remove(@Param('id') id: string) {
    return this.tipofinanciamientoService.remove(id);
  }
}
