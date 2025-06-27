import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolsService } from 'src/users/services/rols.service';
import { createPermissionsDTO } from 'src/users/dtos/user-permissions.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { paginationRolsDTO } from 'src//users/dtos/rols-pagination.dto';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { Public } from '@auth/decorators/public.decorator';

@ApiTags('Rols')
@UseGuards(JwtAuthGuard)
@Controller('admin/roles')
export class RolsController {
  constructor(private readonly rolService: RolsService) {}

  @Get()
  @ApiOperation({
    summary: 'Endpoint para poder listar los usuarios con paginación',
  })
  @HttpCode(HttpStatus.OK)
  findAll(@Query() params: paginationRolsDTO) {
    return this.rolService.findAll(params);
  }

  @Public()
  @Get('/permisos-modulos/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Este endpoint lista los permisos de un rol.',
  })
  permisosById(@Param('id') id: string) {
    return this.rolService.findPermissionsById(id);
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Endpoint para poder realizar la búsqueda de un rol de usuario en especifico.',
  })
  @HttpCode(HttpStatus.OK)
  get(@Param('id') id: string) {
    return this.rolService.findOne(id);
  }

  @Public()
  @Post('/permisos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Este endpoint actualiza los permisos de un rol de usuario.',
  })
  permisos(@Body() payload: createPermissionsDTO) {
    return this.rolService.permisos(payload.id, payload.array);
  }
}
