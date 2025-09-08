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
import { ApiTags } from '@nestjs/swagger';
import { ClaseService } from './clase.service';
import { CreateClaseDto } from './dto/create-clase.dto';
import { UpdateClaseDto } from './dto/update-clase.dto';
import { DesactivarClaseDto } from './dto/desactivar-clase.dto';

@ApiTags('administracion/catalogos/clase')
@Controller('api/v1/administracion/catalogos/clase')
export class ClaseController {
  constructor(private readonly service: ClaseService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('limit') limit = 10,
  ) {
    return this.service.search(q, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateClaseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateClaseDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/activar')
  activar(@Param('id') id: string) {
    return this.service.activar(id);
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id') id: string, @Body() dto: DesactivarClaseDto) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
