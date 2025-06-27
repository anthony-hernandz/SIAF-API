import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MntModules } from '../entities/mntModules.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(MntModules)
    private readonly moduleRepository: Repository<MntModules>,
  ) {}

  async findAll() {
    return await this.moduleRepository.find();
  }

  async findById(id: string): Promise<MntModules> {
    return await this.moduleRepository.findOne({ where: { id } });
  }

  async findByRouteAndMethod(
    route: string,
    method: string,
  ): Promise<MntModules> {
    return await this.moduleRepository.findOne({
      where: { filename: route, method, active: true },
    });
  }
}
