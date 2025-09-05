import { Controller, Get } from '@nestjs/common';
import { DependenciaService } from './dependencia.service';
import { CtlDependencia } from '../database/entities/CtlDependencia.entity';

@Controller('dependencias')
export class DependenciaController {
  constructor(private readonly dependenciaService: DependenciaService) {}

  @Get()
  async listar(): Promise<CtlDependencia[]> {
    return this.dependenciaService.obtenerDependencias();
  }
}