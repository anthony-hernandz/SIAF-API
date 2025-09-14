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
import { ApiTags } from '@nestjs/swagger';
import { SubclaseService } from './subclase.service';
import { CreateSubclaseDto } from './dto/create-subclase.dto';
import { UpdateSubclaseDto } from './dto/update-subclase.dto';
import { DesactivarSubclaseDto } from './dto/desactivar-subclase.dto';

@ApiTags('Administracion/Catalogos/Subclase')
@Controller('api/v1/administracion/catalogos/subclase')
export class SubclaseController {
  constructor(private readonly service: SubclaseService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('claseId') claseId?: string,
  ) {
    return this.service.search(q, Number(page), Number(limit), claseId);
  }

  @Get('activos')
  activos(@Query('claseId') claseId?: string) {
    return this.service.activos(claseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSubclaseDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubclaseDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/activar')
  activar(@Param('id') id: string) {
    return this.service.activar(id);
  }

  @Patch(':id/desactivar')
  desactivar(@Param('id') id: string, @Body() dto: DesactivarSubclaseDto) {
    return this.service.desactivar(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
