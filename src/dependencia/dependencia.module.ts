import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CtlDependencia } from '../database/entities/CtlDependencia.entity';
import { DependenciaService } from './dependencia.service';
import { DependenciaController } from './dependencia.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CtlDependencia])],
  providers: [DependenciaService],
  controllers: [DependenciaController],
})
export class DependenciaModule {}