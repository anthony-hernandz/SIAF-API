import {
  UseGuards,
  Controller,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { ModulesService } from '@modules/services/modules.service';
import { ApiTags } from '@nestjs/swagger';

@UseGuards(JwtAuthGuard)
@Controller('admin/modulos')
export class ModulosController {
  constructor(private readonly modulosService: ModulesService) {}

  @HttpCode(HttpStatus.OK)
  @ApiTags('moudlos')
  @Get()
  async findAll() {
    return await this.modulosService.findAll();
  }
}
