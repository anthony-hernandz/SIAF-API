import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CtlDependencia } from '../database/entities/CtlDependencia.entity';

@Injectable()
export class DependenciaService {
  constructor(
    @InjectRepository(CtlDependencia)
    private readonly dependenciaRepo: Repository<CtlDependencia>,
  ) {}

  async obtenerDependencias(): Promise<CtlDependencia[]> {
    return this.dependenciaRepo.find({ where: { habilitado: true } });
  }
}