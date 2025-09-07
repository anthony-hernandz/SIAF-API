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
import { GrupoService } from './grupo.service';
import { CreateGrupoDto } from './dto/create-grupo.dto';
import { UpdateGrupoDto } from './dto/update-grupo.dto';
import { DesactivarGrupoDto } from './dto/desactivar-grupo.dto';

@ApiTags('Administracion/catalogos/grupo')
@Controller('api/v1/administracion/catalogos/grupo')
export class GrupoController {
  constructor(private readonly service: GrupoService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ){
    return this.service.search(q, Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateGrupoDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/activar')
  activar(@Param('id') id: string) {
    return this.service.activar(id);
  }

  @Post(':id/desactivar')
  desactivar(@Param('id') id: string, @Body() dto: DesactivarGrupoDto) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
