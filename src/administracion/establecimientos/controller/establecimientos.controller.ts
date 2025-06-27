import {
  Controller,
  Query,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { EstablecimientosService } from '../establecimientos.service';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';

@Controller('establecimientos')
@UseGuards(JwtAuthGuard)
export class EstablecimientosController {
  constructor(
    private readonly establecimientosService: EstablecimientosService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all establishment' })
  @Get()
  async findAll(@Query() data: any) {
    return await this.establecimientosService.findAll(data);
  }
}
