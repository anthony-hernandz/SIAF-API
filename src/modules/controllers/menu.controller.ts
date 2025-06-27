import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { MenuService } from '@modules/services/menu.service';
import { Public } from '@auth/decorators/public.decorator';

@ApiTags('Menu')
@UseGuards(JwtAuthGuard)
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List all menu items',
  })
  find() {
    return this.menuService.findAll();
  }

  @Public()
  @Post('etiqueta')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Etiqueta',
  })
  create(@Body() data: any) {
    return this.menuService.createEtiqueta(data);
  }

  @Public()
  @Post('menu')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Etiqueta',
  })
  menu(@Body() data: any) {
    return this.menuService.createMenu(data);
  }

  @Public()
  @Post('module')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Etiqueta',
  })
  module(@Body() data: any) {
    return this.menuService.createModule(data);
  }

  @Public()
  @Post('permisos-endpoints')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Etiqueta',
  })
  createpermiso(@Body() data: any) {
    return this.menuService.createPermisosArrayModulos(
      data.idView,
      data.IdsEndpoints,
    );
  }
}
